import Board from "@/db/models/Board";
import Task from "@/db/models/Task";
import { requireUserSession } from "@/lib/apiAuth";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { ObjectId, Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = await params;

    const userId = await requireUserSession();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const data = await req.json();
    const { taskId } = await params;

    const userId = await requireUserSession();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        { error: "Only task or board creator can edit" },
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
