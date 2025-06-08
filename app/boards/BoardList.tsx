"use client";
import { Board as BoardType } from "@/types/Board/board";
import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Board from "./Board";

interface BoardListProps {
  userId: string;
}

// Could add pagination

const BoardList = ({ userId }: BoardListProps) => {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  useEffect(() => {
    const fetchBoards = async () => {
      if (!userId) return; // Early return if no user ID

      try {
        const response = await fetch(`/api/users/${userId}/boards`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        setBoards(data.boards || []); // Set boards from response
      } catch (error) {
        console.error("Failed to fetch boards:", error);
        setBoards([]); // Reset to empty array on error
      }
    };

    fetchBoards();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoHome}
              className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </button>

            <div className="h-8 w-px bg-gray-300"></div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Discover New Boards
              </h1>
              <p className="text-gray-600 text-lg">
                Join boards created by other users and start collaborating
              </p>
            </div>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {boards.map((board: BoardType) => (
            <Board
              key={board._id.toString()}
              board={board}
              userId={userId}
              setBoards={setBoards}
            />
          ))}
        </div>

        {/* Empty State */}
        {boards.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No New Boards Available
              </h3>
              <p className="text-gray-600 mb-6">
                You have already joined all available boards, or there are no public
                boards to join at the moment.
              </p>
              <button
                onClick={handleGoHome}
                className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardList;
