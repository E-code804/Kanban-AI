export function setErrors(
  errorName: string,
  errorMessage: string
): { type: "SET_ERRORS"; payload: { errorName: string; errorMessage: string } } {
  return {
    type: "SET_ERRORS",
    payload: {
      errorName,
      errorMessage,
    },
  };
}
