import { Types } from "mongoose";

export interface Task {
  _id: Types.ObjectId;
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

export type TaskContextAction =
  | {
      type: "SET_TASKS";
      payload: {
        boardId: string;
        boardName: string;
        tasks: Task[];
      };
    }
  | {
      type: "UPDATE_TASK";
      payload: {
        taskId: string;
        updates: Partial<Task>;
      };
    }
  | {
      type: "DELETE_TASK";
      payload: {
        taskId: string;
      };
    };
