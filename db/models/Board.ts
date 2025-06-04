// src/models/Board.ts (Mongoose)
import { Document, Schema, Types, model } from "mongoose";

export interface IBoard extends Document {
  title: string;
  description?: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const BoardSchema = new Schema<IBoard>({
  title: { type: String, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

BoardSchema.index({ createdBy: 1 });
BoardSchema.index({ members: 1 });

export default model<IBoard>("Board", BoardSchema);
