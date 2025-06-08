import { useRouter } from "next/navigation";
import React from "react";

const Actions = () => {
  const router = useRouter();

  const handleCreateBoard = () => {
    router.push("/boards/new");
  };
  return (
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      {/* Create board btn */}
      <button
        onClick={handleCreateBoard}
        className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-sm mb-2"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create New Board
      </button>
    </div>
  );
};

export default Actions;
