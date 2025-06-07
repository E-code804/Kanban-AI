"use client";
import { Task, TaskContextAction, TaskContextState } from "@/types/Task/task";
import { createContext, ReactNode, useReducer } from "react";

const initialState: TaskContextState = {
  boardId: "",
  boardName: "",
  tasks: [],
};

// Will likely need a Board context too.
export const TaskContext = createContext<{
  state: TaskContextState;
  dispatch: React.Dispatch<TaskContextAction>;
} | null>(null);

// Could have a loading state
export const taskReducer = (state: TaskContextState, action: TaskContextAction) => {
  switch (action.type) {
    case "SET_TASKS": {
      // User clicks on a board from sidebar and updates the boardID & tasks.
      const { boardId, boardName, tasks } = action.payload;
      return { boardId, boardName, tasks };
    }
    case "ADD_TASK": {
      const { task } = action.payload;
      // May want to sort task
      return { ...state, tasks: [...state.tasks, task] };
    }
    case "UPDATE_TASK": {
      // User makes some sort of update on task.  MUST DECIDE IF USER IS ALLOWED TO MODIFY.
      const { taskId, updates } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task: Task) =>
          task._id.toString() === taskId ? { ...task, ...updates } : task
        ),
      };
    }
    case "DELETE_TASK": {
      // User wants to delete a task. MUST DECIDE IF USER IS ALLOWED TO DELETE.
      const { taskId } = action.payload;
      return {
        ...state,
        task: state.tasks.filter((task: Task) => task._id.toString() !== taskId),
      };
    }
    default:
      return state;
  }
};

export const TaskContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};
