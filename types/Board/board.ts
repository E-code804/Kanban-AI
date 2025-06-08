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

export interface BoardContextState {
  selectedBoardId: string;
  boardName: string;
  boards: Board[];
}

export type BoardContextAction =
  | {
      type: "SET_BOARDS";
      payload: {
        boards: Board[];
      };
    }
  | {
      type: "SET_BOARD_INFO";
      payload: { selectedBoardId: string; boardName: string };
    };

// Used in UserBoards.tsx
export interface UserBoardsProps {
  loading: boolean;
  boards: Board[];
}
