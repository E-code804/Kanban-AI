export function setErrors(
  errorName: string,
  errorMessage: string | Error
): { type: "SET_ERRORS"; payload: { errorName: string; errorMessage: string } } {
  return {
    type: "SET_ERRORS",
    payload: {
      errorName,
      errorMessage:
        errorMessage instanceof Error
          ? errorMessage.message
          : errorMessage || "An unexpected error occurred",
    },
  };
}
