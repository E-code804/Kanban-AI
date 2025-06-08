import { useTask } from "@/app/hooks/useTaskContext";
import { UserBoardsProps } from "@/types/Board/board";
import { Types } from "mongoose";
import { useEffect } from "react";

const UserBoards: React.FC<UserBoardsProps> = ({ loading, boards }) => {
  const { state, dispatch } = useTask();

  // Sets the board ID and fetches tasks for that board.
  // Store in local storage the prev board ID and tasks so refreshing doesn't reset.s
  const handleBoardClick = async (boardId: Types.ObjectId, boardTitle: string) => {
    try {
      const boardIdStr = boardId.toString();
      const response = await fetch(`/api/kanban/boards/${boardId}/task`);

      if (!response.ok) {
        console.log("An error occurred fetching boards.");
        return;
      }

      const json = await response.json();
      dispatch({
        type: "SET_TASKS",
        payload: { boardId: boardIdStr, boardName: boardTitle, tasks: json.tasks },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    console.log(state.boardId);
  }, [state.boardId]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Your Boards
        </h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
          {boards.length}
        </span>
      </div>

      {loading ? (
        // Loading animation
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : boards.length > 0 ? (
        <div className="space-y-2">
          {boards.map((board) => (
            <div
              key={board._id.toString()}
              onClick={() => handleBoardClick(board._id, board.title)}
              className="cursor-pointer block p-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border border-transparent hover:border-indigo-100 transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3 group-hover:from-indigo-600 group-hover:to-purple-600"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {board.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Updated recently</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-3">No boards yet</p>
          <p className="text-xs text-gray-400">
            Create your first board to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default UserBoards;
