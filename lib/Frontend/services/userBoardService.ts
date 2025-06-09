import { ErrorContextAction } from "@/types/Error/error";
import { TaskContextAction } from "@/types/Task/task";
import { Types } from "mongoose";
import { setErrors } from "./errorService";

const handleBoardClick = async (
  boardId: Types.ObjectId,
  boardTitle: string,
  taskDispatch: React.Dispatch<TaskContextAction>,
  errorDispatch: React.Dispatch<ErrorContextAction>,
  errorName: string
) => {
  try {
    const boardIdStr = boardId.toString();
    const response = await fetch(`/api/kanban/boards/${boardId}/task`);
    const json = await response.json();

    if (!response.ok) {
      console.log("An error occurred fetching boards.");
      const errorMessage =
        json.message || "Failed to fetch tasks for selected board.";
      errorDispatch(setErrors(errorName, errorMessage));
      return;
    }

    taskDispatch({
      type: "SET_TASKS",
      payload: { boardId: boardIdStr, boardName: boardTitle, tasks: json.tasks },
    });
    errorDispatch({ type: "RESET_ERRORS" });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : ("An unexpected error occurred" as string);
    errorDispatch(setErrors(errorName, errorMessage));
  }
};

export { handleBoardClick };
