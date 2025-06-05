import { TaskContext } from "@/app/context/TaskContext";
import { useContext } from "react";

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useUser must be used within a TaskContextProvider");
  }
  return context;
};
