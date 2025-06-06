import Board from "@/db/models/Board";
import Task from "@/db/models/Task";
import { getUserId } from "@/lib/apiAuth";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { TaskParams } from "@/types/Task/task";
import { ObjectId, Types } from "mongoose";
import { NextResponse } from "next/server";

/**
 * Retrieve a single task by its ID.
 *
 * @param req     - A Request object (no body required for GET).
 * @param params  - An object containing:
 *   - taskId: string (the ID of the task to retrieve)
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Task found",
 *       task: Task
 *     }
 *     – The full task document with all its fields.
 *
 *   • 404 Not Found (no task with the given ID exists):
 *     {
 *       error: "Task not found."
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<TaskParams> }
) {
  try {
    const { taskId } = await params;

    await connectDB();

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Task found", task }, { status: 200 });
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Update specified fields of an existing task, ensuring only the task creator or board creator may edit.
 *
 * @param req     - A Request object whose JSON body may include:
 *   - title?: string
 *   - description?: string
 *   - status?: "notStarted" | "inProgress" | "verification" | "finished"
 *   - priority?: "Low" | "Medium" | "High"
 *   - dueDate?: string (ISO date string, e.g. "2025-06-10T00:00:00.000Z")
 *   - assignedTo?: string (ObjectId of the user to assign to)
 *   – At least one of these fields must be provided to update; omitted fields remain unchanged.
 * @param params  - An object containing:
 *   - taskId: string (the ID of the task to update)
 *
 * Internally, this function:
 *   1. Connects to MongoDB.
 *   2. Fetches the existing task by `taskId`. If not found, returns 404.
 *   3. Retrieves the associated board and checks that the requesting user (from getUserId) is a member.
 *   4. Verifies that the `userId` matches either `task.createdBy` or `board.createdBy`. If not, returns 403.
 *   5. Builds an `updateFields` object from any valid optional inputs:
 *      – Converts `dueDate` (if present) to a Date instance.
 *      – Converts `assignedTo` (if present) to a Mongoose ObjectId.
 *   6. If no valid update fields were supplied, returns 400.
 *   7. Applies the update via `findByIdAndUpdate`, returning the updated document.
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       _id: string,
 *       boardId: string,
 *       title: string,
 *       description?: string,
 *       labels: string[],
 *       status: string,
 *       priority: string,
 *       dueDate?: string,
 *       createdBy: string,
 *       assignedTo?: string,
 *       createdAt: string,
 *       updatedAt: string
 *     }
 *     – The full updated task document.
 *
 *   • 400 Bad Request:
 *     {
 *       error: "No valid fields provided to update"
 *     }
 *     or
 *     {
 *       error: "Invalid assignedTo user ID"
 *     }
 *
 *   • 403 Forbidden:
 *     {
 *       error: "Not a board member"
 *     }
 *     or
 *     {
 *       error: "Only task or board creator can edit"
 *     }
 *
 *   • 404 Not Found:
 *     {
 *       error: "Task not found."
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception or failed update):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<TaskParams> }
) {
  try {
    const data = await req.json();
    const { taskId } = await params;

    const userId = await getUserId(req);

    await connectDB();

    const { title, description, status, priority, dueDate, assignedTo } = data;

    // Verify that the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const board = await Board.findById({ _id: task.boardId });
    const isMemeber = board.members.some((m: ObjectId) => m.toString() === userId);
    if (!isMemeber) {
      return NextResponse.json({ error: "Not a board member" }, { status: 403 });
    }

    // Could check that current user is the creator (only creator should mod?)
    if (
      task.createdBy.toString() !== userId ||
      board.createdBy.toString() !== userId
    ) {
      return NextResponse.json(
        { error: "Only task creator or board creator can edit" },
        { status: 403 }
      );
    }

    const updateFields: Partial<{
      title: string;
      description: string;
      status: "notStarted" | "inProgress" | "verification" | "finished";
      priority: "Low" | "Medium" | "High";
      dueDate: Date;
      assignedTo: Types.ObjectId;
    }> = {};

    if (typeof title === "string") {
      updateFields.title = title;
    }
    if (typeof description === "string") {
      updateFields.description = description;
    }
    if (
      status === "notStarted" ||
      status === "inProgress" ||
      status === "verification" ||
      status === "finished"
    ) {
      updateFields.status = status;
    }
    if (priority === "Low" || priority === "Medium" || priority === "High") {
      updateFields.priority = priority;
    }
    if (typeof dueDate === "string") {
      const parsedDate = new Date(dueDate);
      if (!isNaN(parsedDate.getTime())) {
        updateFields.dueDate = parsedDate;
      }
    }
    if (typeof assignedTo === "string") {
      // Convert assignedTo to a Mongoose ObjectId
      try {
        updateFields.assignedTo = new Types.ObjectId(assignedTo);
      } catch {
        // Invalid ObjectId string was passed
        return NextResponse.json(
          { error: "Invalid assignedTo user ID" },
          { status: 400 }
        );
      }
    }

    // If no valid update fields were sent, return a 400
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    // Perform the update
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }

    // Return the updated task
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (err) {
    handleServerError(err);
  }
}
