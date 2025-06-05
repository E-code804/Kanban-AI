import { NextResponse } from "next/server";

export function handleServerError(err: unknown) {
  return NextResponse.json({
    error: err instanceof Error ? err.message : "An unknown error occurred",
    status: 500,
  });
}
