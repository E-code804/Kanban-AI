import Board from "@/db/models/Board";
import { getUserId } from "@/lib/apiAuth";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// const BoardSchema = new Schema<IBoard>({
//   title: { type: String, required: true },
//   description: { type: String },
//   members: [{ type: Schema.Types.ObjectId, ref: "User" }],
//   createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
// });

/**
 * Retrieve all boards that the authenticated user belongs to.
 *
 * @param req - A Request object (no body required for GET).
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Successfully retrieved boards for user.",
 *       boards: Board[]
 *     }
 *     – An array of board documents where the user is a member.
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);

    await connectDB();

    const boards = await Board.find({ members: userId });

    return NextResponse.json(
      { message: "Successfully retrieved boards for user.", boards },
      { status: 200 }
    );
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Create a new board with the authenticated user as its creator and sole initial member.
 *
 * @param req - A Request object whose JSON body must include:
 *   - title: string (the board’s title) [required]
 *   - description?: string (an optional description for the board)
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 201 Created:
 *     {
 *       boardId: "<MongoDB ObjectId of the newly created board>",
 *       title: string,
 *       description: string,
 *       members: string[],     // [userId]
 *       createdBy: string,     // userId
 *       createdAt: string      // ISO timestamp
 *     }
 *
 *   • 400 Bad Request (missing or empty title):
 *     {
 *       message: "Missing fields."
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;
    const userId = await getUserId(req);

    if (!title?.trim()) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    await connectDB();

    const newBoard = {
      title,
      description: description || "",
      members: [userId],
      createdBy: userId,
      createdAt: new Date(),
    };
    const result = await Board.create(newBoard);

    return NextResponse.json({ boardId: result._id, ...newBoard }, { status: 201 });
  } catch (err) {
    return handleServerError(err);
  }
}
