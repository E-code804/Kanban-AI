import { useError } from "@/app/hooks/useErrorContext";
import { useTask } from "@/app/hooks/useTaskContext";
import { setErrors as setErrorMessages } from "@/lib/Frontend/services/errorService";
import { getMembers } from "@/lib/Frontend/services/taskEditFormService";
import { MemberType, TaskEditFormProps, UpdatedTask } from "@/types/Task/task";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ErrorMessage from "../ErrorMessage";

const TaskEditForm = ({ task, setToggleTaskForm }: TaskEditFormProps) => {
  const { state: taskState, dispatch: taskDispatch } = useTask();
  const { state: errorState, dispatch: errorDispatch } = useError();

  const fetchMembersError = "fetchMembersError";
  const deleteError = "deleteError";
  const updateError = "updateError";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<MemberType[]>();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    assignedTo: task.assignedTo,
  });

  useEffect(() => {
    getMembers(taskState, setMembers, errorDispatch, fetchMembersError);
  }, [errorDispatch, taskState, taskState.boardId]);

  const validateForm = (updatedTask: UpdatedTask) => {
    const newErrors: Record<string, string> = {};

    if (!updatedTask.title) newErrors.title = "Title is required";
    if (!updatedTask.description) newErrors.description = "Description is required";
    if (!updatedTask.dueDate) newErrors.dueDate = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async () => {
    setIsLoadingDelete(true);

    try {
      const response = await fetch(`/api/kanban/tasks/${task._id}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        console.error("Failed to delete task");
        const errorMessage =
          json.error || json.message || `Failed to delete task (${response.status})`;
        errorDispatch(setErrorMessages(deleteError, errorMessage));
        return;
      }

      // Success - clear errors and update state
      errorDispatch({ type: "RESET_ERRORS" });
      taskDispatch({
        type: "DELETE_TASK",
        payload: { taskId: task._id.toString() },
      });
      setToggleTaskForm(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : ("An unexpected error occurred" as string);
      errorDispatch(setErrorMessages(deleteError, errorMessage));
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTask = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    };

    if (!validateForm(updatedTask)) return;

    setIsLoadingSubmit(true);

    try {
      const response = await fetch(`/api/kanban/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedTask }),
      });

      const json = await response.json();

      if (!response.ok) {
        console.log("Error updating task");
        const errorMessage =
          json.error || json.message || `Failed to update task (${response.status})`;
        errorDispatch(setErrorMessages(updateError, errorMessage));
        return;
      }

      // Success - clear errors and update state
      errorDispatch({ type: "RESET_ERRORS" });
      taskDispatch({
        type: "UPDATE_TASK",
        payload: { taskId: task._id.toString(), updates: updatedTask },
      });
      setToggleTaskForm(false);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : ("An unexpected error occurred" as string);
      errorDispatch(setErrorMessages(updateError, errorMessage));
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    setToggleTaskForm(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setToggleTaskForm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={handleCancel}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter task title"
            />
          </div>
          {errors.title && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.title}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Enter task description"
            />
          </div>
          {errors.description && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.description}</p>
            </div>
          )}

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="cursor-pointer">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="notStarted">Not Started</option>
                <option value="inProgress">In Progress</option>
                <option value="verification">Verification</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Priority */}
            <div className="cursor-pointer">
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Assign to */}
          {errorState.errors[fetchMembersError] ? (
            <ErrorMessage
              title="Error fetching the members of this board."
              errorMessage={errorState.errors[fetchMembersError]}
            />
          ) : (
            <div>
              <label
                htmlFor="assignedTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to:
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo?.toString() || ""}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.member
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  -- Select a member --
                </option>
                {members &&
                  members.map((member: MemberType) => (
                    <option
                      key={member._id.toString()}
                      value={member._id.toString()}
                    >
                      {member.name}
                    </option>
                  ))}
              </select>
              {errors.member && (
                <p className="mt-1 text-sm text-red-600">{errors.member}</p>
              )}
            </div>
          )}

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          {errors.dueDate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.dueDate}</p>
            </div>
          )}

          {/* Action Buttons */}
          {errorState.errors[deleteError] && (
            <ErrorMessage
              title="Error deleting task."
              errorMessage={errorState.errors[deleteError]}
            />
          )}
          {errorState.errors[updateError] && (
            <ErrorMessage
              title="Error updating task."
              errorMessage={errorState.errors[updateError]}
            />
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoadingDelete}
              onClick={handleDelete}
              className="cursor-pointer flex px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              {isLoadingDelete ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Deleting task...
                </>
              ) : (
                "Delete Task"
              )}
            </button>
            <button
              type="submit"
              disabled={isLoadingSubmit}
              className="cursor-pointer flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isLoadingSubmit ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Saving changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditForm;
