import { Board as BoardType } from "@/types/Board/board";
import { Calendar, Loader2, Users } from "lucide-react";
import React, { useState } from "react";

interface BoardProps {
  board: BoardType;
  userId: string;
  setBoards: React.Dispatch<React.SetStateAction<BoardType[]>>;
}
const Board = ({ board, userId, setBoards }: BoardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleJoin = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/kanban/boards/${board._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add_member",
          userId,
        }),
      });

      if (!response.ok) {
        console.log("Error adding member");
      }

      setBoards((prevBoards) =>
        prevBoards.filter((prevBoard: BoardType) => prevBoard._id !== board._id)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      key={board._id.toString()}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {board.title}
          </h3>
        </div>

        {board.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {board.description}
          </p>
        )}

        {/* Board Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{board.members?.length || 0} members</span>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(board.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="cursor-pointer flex w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Joining Board...</span>
            </>
          ) : (
            <>
              <span>Join Board</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Board;
