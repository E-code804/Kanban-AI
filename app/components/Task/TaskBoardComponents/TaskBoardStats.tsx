import { Task } from "@/types/Task/task";
import React, { JSX } from "react";

interface TaskBoardStatsProps {
  columns: {
    title: string;
    status: string;
    color: string;
    icon: JSX.Element;
  }[];
  getTasksByStatus: (status: string) => Task[];
}
const TaskBoardStats = ({ columns, getTasksByStatus }: TaskBoardStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {columns.map((column) => {
        const taskCount = getTasksByStatus(column.status).length;
        return (
          <div
            key={column.status}
            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center">
              <div className="mr-3">{column.icon}</div>
              <div>
                <p className="text-sm text-gray-600">{column.title}</p>
                <p className="text-2xl font-bold text-gray-900">{taskCount}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoardStats;
