import { TaskCardProps } from "@/types/Task/task";
import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import TaskEditForm from "./TaskEditForm";

const TaskCard = ({ task, index }: TaskCardProps) => {
  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  const [toggleTaskForm, setToggleTaskForm] = useState<boolean>(false);
  const [viewMore, setViewMore] = useState<boolean>(false);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggleTaskForm((prevToggle) => !prevToggle);
  };

  useEffect(() => {
    if (!task.assignedTo) {
      setAssigneeName(null);
      return;
    }

    // Fetch the user by ID and grab their name
    fetch(`/api/users/${task.assignedTo.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setAssigneeName(data.user.name);
      })
      .catch(() => {
        setAssigneeName(null);
      });
  }, [task.assignedTo]);

  return (
    <>
      {toggleTaskForm && (
        <TaskEditForm task={task} setToggleTaskForm={setToggleTaskForm} />
      )}
      <Draggable draggableId={task._id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-all duration-200 cursor-pointer group relative ${
              snapshot.isDragging
                ? "shadow-lg transform rotate-3 scale-105 z-50"
                : ""
            }`}
            style={{
              ...provided.draggableProps.style,
              // Ensure proper transform when dragging
              transform: snapshot.isDragging
                ? `${provided.draggableProps.style?.transform} rotate(5deg) scale(1.05)`
                : provided.draggableProps.style?.transform,
            }}
          >
            {/* Edit icon - appears on hover */}
            <button
              onClick={handleEditClick}
              className="cursor-pointer absolute top-[-10px] right-[-10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-gray-100 z-10"
              title="Edit task"
            >
              <svg
                className="w-4 h-4 text-gray-500 hover:text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Header of the task */}
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                {task.title}
              </h4>
              {task.priority && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              )}
            </div>

            {task.description && (
              <>
                <p
                  className={`text-sm text-gray-600 mb-3 ${
                    viewMore ? "" : "line-clamp-2"
                  }`}
                >
                  {task.description}
                </p>
                {task.description.length > 120 && (
                  <p
                    className="underline text-sm text-gray-600 mb-3"
                    onClick={() => setViewMore((prevView) => !prevView)}
                  >
                    {viewMore ? "View less" : "View more"}
                  </p>
                )}
              </>
            )}

            {/* Name & due date */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              {task.assignedTo && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-medium text-xs">
                        {assigneeName ? assigneeName.charAt(0).toUpperCase() : "…"}
                      </span>
                    </div>
                    <span>{assigneeName ?? "Loading…"}</span>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <span className="flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {task.labels.slice(0, 3).map((label, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md"
                  >
                    {label}
                  </span>
                ))}
                {task.labels.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-md">
                    +{task.labels.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>
    </>
  );
};

export default TaskCard;
