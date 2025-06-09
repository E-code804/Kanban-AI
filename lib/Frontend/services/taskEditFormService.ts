// Import statements - adjust paths according to your project structure
import { ErrorContextAction } from "@/types/Error/error";
import { MemberType, TaskContextAction } from "@/types/Task/task";
import { setErrors as setErrorMessages } from "./errorService"; // or wherever your setErrorMessages function is located

// Types
interface TaskState {
  boardId: string;
}

// Function type interface
interface GetMembers {
  (
    taskState: TaskState,
    setMembers: React.Dispatch<React.SetStateAction<MemberType[] | undefined>>,
    errorDispatch: React.Dispatch<ErrorContextAction>,
    fetchMembersError: string
  ): Promise<void>;
}

const getMembers: GetMembers = async (
  taskState,
  setMembers,
  errorDispatch,
  fetchMembersError
) => {
  try {
    const response = await fetch(`/api/kanban/boards/${taskState.boardId}`);
    const json = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch board members");
      const errorMessage =
        json.error ||
        json.message ||
        `Failed to fetch board members (${response.status})`;
      errorDispatch(setErrorMessages(fetchMembersError, errorMessage));
      return;
    }

    // Success - clear errors and set members
    errorDispatch({ type: "RESET_ERRORS" });
    setMembers(json.board.members);
  } catch (error) {
    console.error("Error fetching members:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : ("An unexpected error occurred" as string);
    errorDispatch(setErrorMessages(fetchMembersError, errorMessage));
  }
};

// Import statements - adjust paths according to your project structure
import React from "react";

// Types
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  // Add other task properties as needed
}

interface FormData {
  title: string;
  description?: string;
  dueDate?: string;
  // Add other form data properties as needed
}

// Function type interfaces
interface HandleDelete {
  (
    task: Task,
    setIsLoadingDelete: (loading: boolean) => void,
    errorDispatch: React.Dispatch<ErrorContextAction>,
    taskDispatch: React.Dispatch<TaskContextAction>,
    setToggleTaskForm: (toggle: boolean) => void,
    deleteError: string
  ): Promise<void>;
}

interface HandleSubmit {
  (
    e: React.FormEvent,
    task: Task,
    formData: FormData,
    isValidForm: boolean,
    setIsLoadingSubmit: (loading: boolean) => void,
    errorDispatch: React.Dispatch<ErrorContextAction>,
    taskDispatch: React.Dispatch<TaskContextAction>,
    setToggleTaskForm: (toggle: boolean) => void,
    updateError: string
  ): Promise<void>;
}

const handleDelete: HandleDelete = async (
  task,
  setIsLoadingDelete,
  errorDispatch,
  taskDispatch,
  setToggleTaskForm,
  deleteError
) => {
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

const handleSubmit: HandleSubmit = async (
  e,
  task,
  formData,
  isValidForm,
  setIsLoadingSubmit,
  errorDispatch,
  taskDispatch,
  setToggleTaskForm,
  updateError
) => {
  e.preventDefault();
  const updatedTask = {
    ...formData,
    dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
  };

  if (!isValidForm) return;

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

export { getMembers, handleDelete, handleSubmit };
