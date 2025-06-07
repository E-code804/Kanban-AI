// components/TaskDisplay.tsx
"use client";
import { useTask } from "@/app/hooks/useTaskContext";
import { Task } from "@/types/Task/task";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Types } from "mongoose";
import TaskBoardHeader from "./TaskBoardComponents/TaskBoardHeader";
import TaskBoardStats from "./TaskBoardComponents/TaskBoardStats";
import TaskColumn from "./TaskColumn";

type TaskStatus = "notStarted" | "inProgress" | "verification" | "finished";

const TaskDisplay = () => {
  const { state, dispatch } = useTask();

  const updateTaskStatus = async (taskId: Types.ObjectId, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/kanban/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        console.log("Error updating task");
      }
    } catch (error) {
      console.log(`Server error: ${error}`);
    }
  };

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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task being moved
    const draggedTask = state.tasks.find(
      (task: Task) => task._id.toString() === draggableId
    );

    if (!draggedTask) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // Update task status if moved to different column
    if (destination.droppableId !== source.droppableId) {
      const updatedTask = {
        ...draggedTask,
        status: newStatus,
      };

      // Dispatch action to update task status
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          taskId: draggedTask._id.toString(),
          updates: updatedTask,
        },
      });

      // Make API call to persist the change
      await updateTaskStatus(draggedTask._id, newStatus);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        {/* Header, has title and add task button. */}
        <TaskBoardHeader />

        {/* Stats */}
        <TaskBoardStats columns={columns} getTasksByStatus={getTasksByStatus} />
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 xl:flex xl:gap-6 xl:overflow-x-auto pb-6 max-w-full">
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
      </DragDropContext>
    </div>
  );
};

export default TaskDisplay;
