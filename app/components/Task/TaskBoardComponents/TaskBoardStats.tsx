import { TaskBoardStatsProps } from "@/types/Task/task";

const TaskBoardStats = ({ columns, getTasksByStatus }: TaskBoardStatsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
      {columns.map((column) => {
        const taskCount = getTasksByStatus(column.status).length;
        return (
          <div
            key={column.status}
            className="bg-white rounded-lg p-2 sm:p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-center md:justify-normal">
              <div className="mr-3 hidden md:block">{column.icon}</div>
              <div className="text-center md:text-left">
                <p className="text-xs sm:text-sm text-gray-600">{column.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {taskCount}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoardStats;
