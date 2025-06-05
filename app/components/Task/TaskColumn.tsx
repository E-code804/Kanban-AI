import { Task } from "@/types/Task/task";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: string;
  color: string;
  icon: React.ReactNode;
}

const TaskColumn = ({ title, tasks, color, icon }: TaskColumnProps) => {
  return (
    <div className="flex-1 min-w-80 max-w-sm">
      {/* Column Header */}
      <div className={`rounded-lg p-4 mb-4 ${color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3">{icon}</div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="flex items-center">
            <span className="bg-white bg-opacity-80 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div className="space-y-3 min-h-96">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task._id.toString()} task={task} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            {/* Icon for no tasks */}
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6"
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
            <p className="text-sm text-center">No tasks in {title.toLowerCase()}</p>
            <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
