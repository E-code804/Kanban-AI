import User from "@/db/models/User";
import { handleServerError } from "@/lib/Backend/errorHandler";
import { connectDB } from "@/lib/Backend/mongodb";
import { UserParams } from "@/types/User/user";
import { NextResponse } from "next/server";

/**
 * Retrieve a specific user by ID.
 *
 * @param req     - A Request object (no body required for GET).
 * @param params  - An object containing:
 *   - userId: string (the ID of the user being requested)
 *
 * @returns NextResponse containing a JSON object with:
 *   • 200 OK:
 *     {
 *       message: "User found",
 *       user: User
 *     }
 *     – A success message and the user object with the specified ID.
 *
 *   • 404 Not Found:
 *     {
 *       error: "User not found."
 *     }
 *     – When no user exists with the provided ID.
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<UserParams> }
) {
  try {
    const { userId } = await params;

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User found", user }, { status: 200 });
  } catch (err) {
    return handleServerError(err);
  }
}
