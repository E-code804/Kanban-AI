/* 
TODO:
Delete tasks.
*/
import { authOptions } from "@/auth";
import Task from "@/db/models/Task";
import { connectDB } from "@/lib/mongodb";
import { generateKanbanAdviceJson } from "@/lib/OpenAI";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// export interface ITask extends Document {
//   boardId: Types.ObjectId;
//   title: string;
//   description?: string;
//   labels: string[];
//   status: "notStarted" | "inProgress" | "verification" | "finished";
//   priority: "Low" | "Medium" | "High";
//   dueDate?: Date;
//   createdBy: Types.ObjectId;
//   assignedTo?: Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// }

export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const { boardId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Make sure board is valid on only members can get the tasks.

    const tasks = await Task.find({ boardId });
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const { task } = await req.json();
    const { boardId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await connectDB();

    if (!task) {
      return NextResponse.json({ error: "Task are required." }, { status: 400 });
    }

    // Might want check to ensure board exists.

    // advice gives title, description, labels, dueDate, assignedTo, priority
    // Make sure user can pick the member to assign task ot in frontend.
    const advice = await generateKanbanAdviceJson(task, "683ef50c1860ee8c1cc1b37a");

    const newTask = {
      boardId,
      ...advice,
      createdBy: userId,
    };
    const newTaskResult = await Task.create(newTask);

    return NextResponse.json({ taskId: newTaskResult._id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const data = await req.json();
    const { boardId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
