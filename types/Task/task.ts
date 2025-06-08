import { Types } from "mongoose";
import { JSX } from "react";

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

// Used in TaskContext.tsx
export interface TaskContextState {
  boardId: string;
  boardName: string;
  tasks: Task[];
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
    }
  | {
      type: "ADD_TASK";
      payload: {
        task: Task;
      };
    }
  | {
      type: "UPDATE_BOARD_ID";
      payload: {
        boardId: string;
      };
    };

export interface TaskParams {
  taskId: string;
}

// Used in TaskBoardStats.tsx
export interface TaskBoardStatsProps {
  columns: {
    title: string;
    status: string;
    color: string;
    icon: JSX.Element;
  }[];
  getTasksByStatus: (status: string) => Task[];
}

// Used in TaskCard.tsx
export interface TaskCardProps {
  task: Task;
  index: number;
}

// Used in TaskColumn.tsx
export interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: string;
  color: string;
  icon: React.ReactNode;
}

// Used in TaskDisplay.tsx
export type TaskStatus = "notStarted" | "inProgress" | "verification" | "finished";

// Used in TaskEditForm.tsx
export interface TaskEditFormProps {
  task: Task;
  setToggleTaskForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export type UpdatedTask = {
  title: string;
  description?: string;
  status: "notStarted" | "inProgress" | "verification" | "finished";
  priority: "Low" | "Medium" | "High";
  dueDate?: Date;
  assignedTo?: Types.ObjectId;
};

export interface MemberType {
  _id: Types.ObjectId;
  name: string;
}
