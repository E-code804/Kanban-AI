export type ErrorContextAction =
  | {
      type: "SET_ERRORS";
      payload: {
        errorName: string;
        errorMessage: string;
      };
    }
  | {
      type: "RESET_ERRORS";
    };

export interface ErrorContextState {
  errors: Record<string, string>;
}

// Used in ErrorMessage.tsx
export interface ErrorMessageProps {
  title: string;
  errorMessage: string;
}
