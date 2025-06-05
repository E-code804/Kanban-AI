import { useTask } from "@/app/hooks/useTaskContext";
import { useRouter } from "next/navigation";
import React from "react";

const TaskBoardHeader = () => {
  const { state } = useTask();
  const router = useRouter();

  const handleAddTaskClick = () => {
    router.push(`/boards/${state.boardId}/tasks/new`);
  };
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kanban Board {state.boardName ? `- ${state.boardName}` : ""}
        </h1>
        <p className="text-gray-600">
          Manage your tasks across different stages of completion
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {state.boardId ? (
          <button
            onClick={handleAddTaskClick}
            className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center font-medium shadow-sm"
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
            Add Task
          </button>
        ) : (
          <h1>Please select a board</h1>
        )}
      </div>
    </div>
  );
};

export default TaskBoardHeader;
