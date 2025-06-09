// src/models/Task.ts (Mongoose)
import mongoose, { Document, Schema, Types, model } from "mongoose";

export interface ITask extends Document {
  boardId: Types.ObjectId;
  title: string;
  description?: string;
  labels: string[];
  status: "notStarted" | "inProgress" | "verification" | "finished";
  priority: "Low" | "Medium" | "High";
  dueDate?: Date;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    title: { type: String, required: true },
    description: { type: String },
    labels: [{ type: String }],
    status: {
      type: String,
      enum: ["notStarted", "inProgress", "verification", "finished"],
      default: "notStarted",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // createdAt & updatedAt
);

TaskSchema.index({ boardId: 1 }); // Primary query - get all tasks for a board
TaskSchema.index({ assignedTo: 1 }); // Get tasks assigned to a user
TaskSchema.index({ createdBy: 1 }); // Get tasks created by a user

export default mongoose.models.Task || model<ITask>("Task", TaskSchema);
