"use client";
import { ErrorContextAction, ErrorContextState } from "@/types/Error/error";
import { createContext, ReactNode, useReducer } from "react";

const initialState: ErrorContextState = {
  errors: {},
};

export const ErrorContext = createContext<{
  state: ErrorContextState;
  dispatch: React.Dispatch<ErrorContextAction>;
} | null>(null);

export const errorReducer = (
  state: ErrorContextState,
  action: ErrorContextAction
) => {
  switch (action.type) {
    case "SET_ERRORS": {
      const { errorName, errorMessage } = action.payload;
      return { errors: { ...state.errors }, [errorName]: errorMessage };
    }
    case "RESET_ERRORS": {
      return { errors: {} };
    }
    default: {
      return state;
    }
  }
};

export const ErrorContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  return (
    <ErrorContext.Provider value={{ state, dispatch }}>
      {children}
    </ErrorContext.Provider>
  );
};
