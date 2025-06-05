// components/TaskDisplay.tsx
"use client";
import { useTask } from "@/app/hooks/useTaskContext";
import { Task } from "@/types/Task/task";
import TaskBaordHeader from "./TaskBoardComponents/TaskBoardHeader";
import TaskBoardStats from "./TaskBoardComponents/TaskBoardStats";
import TaskColumn from "./TaskColumn";

const TaskDisplay = () => {
  const { state } = useTask();

  // Column configurations
  const columns = [
    {
      title: "Not Started",
      status: "notStarted",
      color: "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200",
      icon: (
        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "In Progress",
      status: "inProgress",
      color: "bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200",
      icon: (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Verification",
      status: "verification",
      color:
        "bg-gradient-to-r from-yellow-50 to-orange-100 border border-yellow-200",
      icon: (
        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Finished",
      status: "finished",
      color: "bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200",
      icon: (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      ),
    },
  ];

  const getTasksByStatus = (status: string): Task[] => {
    return state.tasks.filter((task: Task) => task.status === status);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        {/* Header, has title and add task button. */}
        <TaskBaordHeader />

        {/* Stats */}
        <TaskBoardStats columns={columns} getTasksByStatus={getTasksByStatus} />
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            tasks={getTasksByStatus(column.status)}
            status={column.status}
            color={column.color}
            icon={column.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskDisplay;
