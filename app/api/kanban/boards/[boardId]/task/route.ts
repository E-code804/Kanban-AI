import Task from "@/db/models/Task";
import { getUserId } from "@/lib/apiAuth";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { generateKanbanAdviceJson } from "@/lib/OpenAI";
import { BoardParams } from "@/types/Board/board";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

/**
 * Retrieve all tasks for a specific board.
 *
 * @param req     - A Request object (no body required for GET).
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board whose tasks are being requested)
 *
 * @returns NextResponse containing a JSON object with:
 *   • 200 OK:
 *     {
 *       tasks: Task[]
 *     }
 *     – An array of task objects belonging to the specified board.
 *  • 404 Not Found:
 *     {
 *       message: "Could not retrieve tasks for the selected board.",
 *     }
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const { boardId } = await params;

    await connectDB();

    // Make sure board is valid on only members can get the tasks.

    const tasks = await Task.find({ boardId }).sort({ dueDate: 1 });
    if (!tasks) {
      return NextResponse.json(
        { message: "Could not retrieve tasks for the selected board." },
        { status: 404 }
      );
    }

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Create a new task in a specified board using AI‐generated advice.
 *
 * @param req     - A Request object whose JSON body must include:
 *   - task: string
 *     Example: "Write a widget to show sales data by region, due next Tuesday, assign to Jess"
 *     – This free‐form string is sent to an AI helper that returns structured task fields
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board in which to create the new task)
 *
 * Internally, this function:
 *   1. Validates that the “task” field exists.
 *   2. Connects to MongoDB.
 *   3. Calls `generateKanbanAdviceJson(task, "<exampleUserId>")` to obtain:
 *      {
 *        title: string,
 *        description?: string,
 *        labels?: string[],
 *        dueDate?: Date,
 *        assignedTo?: string,
 *        priority?: "Low" | "Medium" | "High"
 *      }
 *   4. Combines the AI‐generated fields with:
 *      - boardId (from params)
 *      - createdBy (the authenticated user’s ID obtained via getUserId)
 *   5. Inserts the new task document into the `tasks` collection.
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 201 Created:
 *     {
 *       taskId: "<MongoDB ObjectId of the newly created task>"
 *     }
 *
 *   • 400 Bad Request (missing “task” field):
 *     {
 *       error: "Task are required."
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const { task, assigneeId } = await req.json();
    const { boardId } = await params;
    const userId = await getUserId(req);

    await connectDB();

    if (!task || !assigneeId) {
      return NextResponse.json(
        { error: "Task and assigneeId are required." },
        { status: 400 }
      );
    }

    // Might want check to ensure board exists.

    // advice gives title, description, labels, dueDate, assignedTo, priority
    // Make sure user can pick the member to assign task ot in frontend.
    const advice = await generateKanbanAdviceJson(task, assigneeId);

    const newTask = {
      boardId,
      ...advice,
      createdBy: userId,
    };
    const newTaskResult = await Task.create(newTask);

    return NextResponse.json({ task: newTaskResult }, { status: 201 });
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Update one or more fields on an existing task within a board.
 *
 * @param req     - A Request object whose JSON body must include:
 *   - taskId: string (the ID of the task to update)  [required]
 *   - title?: string
 *   - description?: string
 *   - status?: "notStarted" | "inProgress" | "verification" | "finished"
 *   - priority?: "Low" | "Medium" | "High"
 *   - dueDate?: string (ISO date string, e.g. "2025-06-10T00:00:00.000Z")
 *   - assignedTo?: string (ObjectId of the user to assign to)
 *   – Any combination of these optional fields may be sent; omitted fields remain unchanged.
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board that owns the task)
 *
 * Internally, this function:
 *   1. Validates that `taskId` is provided.
 *   2. Connects to MongoDB.
 *   3. Fetches the existing task by `taskId` and checks its `boardId` matches the route’s `boardId`.
 *   4. If found, builds an `updateFields` object from any valid optional inputs:
 *      – Converts `dueDate` (if present) to a Date instance.
 *      – Converts `assignedTo` (if present) to a Mongoose ObjectId.
 *   5. If no valid update fields were supplied, returns a 400.
 *   6. Applies the update via `findByIdAndUpdate`, returning the updated document.
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
 *   • 400 Bad Request (missing taskId or no valid fields to update):
 *     {
 *       error: "Missing taskId"
 *     }
 *     or
 *     {
 *       error: "No valid fields provided to update"
 *     }
 *
 *   • 404 Not Found (task doesn’t exist or doesn’t belong to this board):
 *     {
 *       error: "Task not found on this board"
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
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const data = await req.json();
    const { boardId } = await params;

    await connectDB();

    const { taskId, title, description, status, priority, dueDate, assignedTo } =
      data;

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    // Verify that the task belongs to this board
    const existingTask = await Task.findById(taskId);
    if (!existingTask || existingTask.boardId.toString() !== boardId) {
      return NextResponse.json(
        { error: "Task not found on this board" },
        { status: 404 }
      );
    }

    // Could check that current user is the creator (only creator should mod?)
    // if (existingTask.createdBy.toString() !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

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
    return handleServerError(err);
  }
}
