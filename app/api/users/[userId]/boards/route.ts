import Board from "@/db/models/Board";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { UserParams } from "@/types/User/user";
import { NextResponse } from "next/server";

/**
 * Retrieve all boards where the specified userId is NOT a member.
 *
 * @param req - A Request object (no body required for GET).
 * @param params - Route parameters containing userId.
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Successfully retrieved boards where user is not a member.",
 *       boards: Board[]
 *     }
 *     – An array of board documents where the specified userId is NOT in the members array.
 *
 *   • 400 Bad Request (missing userId parameter):
 *     {
 *       message: "Missing userId parameter."
 *     }
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

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId parameter." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find all boards where the userId is NOT in the members array
    const boards = await Board.find({ members: { $ne: userId } });

    return NextResponse.json(
      {
        message: "Successfully retrieved boards where user is not a member.",
        boards,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleServerError(err);
  }
}
