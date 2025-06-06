import { Types } from "mongoose";

export type Board = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
};

export interface BoardParams {
  boardId: string;
}
