"use client";

import { ErrorContextProvider } from "@/app/context/ErrorContext";
import { TaskContextProvider } from "@/app/context/TaskContext";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ErrorContextProvider>
      <TaskContextProvider>{children}</TaskContextProvider>
    </ErrorContextProvider>
  );
};
