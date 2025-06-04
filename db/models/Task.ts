// src/models/Task.ts (Mongoose)
import { Document, Schema, Types, model } from "mongoose";

export interface ITask extends Document {
  boardId: Types.ObjectId;
  title: string;
  description?: string;
  labels: string[];
  status: "notStarted" | "inProgress" | "verification" | "finished";
  priority: number;
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
    priority: { type: Number, default: 3 },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true } // createdAt & updatedAt
);

export default model<ITask>("Task", TaskSchema);
