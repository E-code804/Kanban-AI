import { Board } from "@/types/Board/board";
import { ErrorContextAction } from "@/types/Error/error";
import { setErrors } from "./errorService";

interface FetchUserBoardsParams {
  setLoading: (loading: boolean) => void;
  setBoards: (boards: Board[]) => void;
  errorDispatch: (value: ErrorContextAction) => void;
  errorName: string;
}

export const fetchUserBoards = async ({
  setLoading,
  setBoards,
  errorDispatch,
  errorName,
}: FetchUserBoardsParams) => {
  setLoading(true);

  try {
    const response = await fetch("/api/kanban/boards");
    const json = await response.json();

    if (!response.ok) {
      console.log("An error occurred fetching boards.");
      const errorMessage = json.message || "Failed to fetch boards for user.";
      errorDispatch(setErrors(errorName, errorMessage));
      return;
    }

    setBoards(json.boards || []);
    errorDispatch({ type: "RESET_ERRORS" });
  } catch (error) {
    console.error("Error fetching boards:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : ("An unexpected error occurred" as string);
    errorDispatch(setErrors(errorName, errorMessage));
  } finally {
    setLoading(false);
  }
};
