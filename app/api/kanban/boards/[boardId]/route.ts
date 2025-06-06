import Board from "@/db/models/Board";
import Task from "@/db/models/Task";
import { getUserId } from "@/lib/apiAuth";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { BoardParams } from "@/types/Board/board";
// import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

/**
 * Retrieve a specific board and verify that the requesting user is a member.
 *
 * @param req     - A Request object (no body required for GET).
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board to retrieve)
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Found board",
 *       board: Board
 *     }
 *     – The full board document, including its members and metadata.
 *
 *   • 403 Forbidden (user is not a member of the board):
 *     {
 *       message: "User not in board"
 *     }
 *
 *   • 404 Not Found (board does not exist):
 *     {
 *       error: "Board not found"
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
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const { boardId } = await params;
    // const userId = await getUserId(req);

    await connectDB();

    const board = await Board.findById(boardId).populate({
      path: "members",
      select: "name",
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // checking for membership in this board
    // const isMemeber = board.members.some((m: ObjectId) => m.toString() == userId);
    // if (!isMemeber) {
    //   return NextResponse.json({ message: "User not in board" }, { status: 403 });
    // }

    return NextResponse.json({ message: "Found board", board }, { status: 200 });
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Delete a board if the requesting user is its creator.
 *
 * @param req     - A Request object whose JSON body must include:
 *   - userId: string (the ID of the user attempting the deletion)
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board to delete)
 *
 * Internally, this function:
 *   1. Connects to MongoDB.
 *   2. Finds the board by _id.
 *   3. Verifies that `board.createdBy` equals `userId`.
 *   4. Deletes the board document if the user is authorized.
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Board deleted successfully"
 *     }
 *
 *   • 400 Bad Request (user is not the creator):
 *     {
 *       error: "Cannot delete board if you are not the creator"
 *     }
 *
 *   • 404 Not Found (board does not exist or deletion count is zero):
 *     {
 *       error: "Board not found"
 *     }
 *     or
 *     {
 *       message: "Board deleted UNSUCCESSFULLY"
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const { boardId } = await params;
    const userId = await getUserId(req);

    await connectDB();

    // First check to ensure the requestor is the creator of the board
    const board = await Board.findOne({ _id: boardId });
    if (!board)
      return NextResponse.json({ error: "Board not found" }, { status: 404 });

    // Prevent removing the board if not the creator
    console.log(board.createdBy, userId);

    if (!(board.createdBy.toString() === userId)) {
      return NextResponse.json(
        { error: "Cannot delete board if you are not the creator" },
        { status: 400 }
      );
    }

    // Delete all tasks associated w/ the board
    const deletedTasks = await Task.deleteMany({ boardId });
    const deleteResult = await Board.deleteOne({ _id: boardId });

    if (deleteResult.deletedCount === 1 && deletedTasks.deletedCount === 1) {
      return NextResponse.json(
        { message: "Board & tasks deleted successfully" },
        { status: 200 }
      );
    } else if (deleteResult.deletedCount === 0 && deletedTasks.deletedCount === 0) {
      return NextResponse.json(
        { error: "Board and tasks deleted unsuccessfully" },
        { status: 404 }
      );
    } else if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Board deleted unsuccessfully" },
        { status: 404 }
      );
    } else if (deletedTasks.deletedCount === 0) {
      return NextResponse.json(
        { error: "Tasks deleted unsuccessfully" },
        { status: 404 }
      );
    } else {
      // Fallback—shouldn't normally occur, but handles any other unexpected combination
      return NextResponse.json(
        { error: "Deletion partially failed" },
        { status: 404 }
      );
    }
  } catch (err) {
    return handleServerError(err);
  }
}

/**
 * Modify the membership of a board by adding or removing a user.
 *
 * @param req     - A Request object whose JSON body must include:
 *   - action: string
 *     • "add_member" to add the user to the board
 *     • "remove_member" to remove the user from the board
 *   - userId: string (the ID of the user to add or remove)
 * @param params  - An object containing:
 *   - boardId: string (the ID of the board to update)
 *
 * Internally, this function:
 *   1. Connects to MongoDB.
 *   2. Uses a switch on `action`:
 *     – "add_member": adds `userId` to the `members` array (no duplication).
 *     – "remove_member": first retrieves the board, ensures `userId` is not the creator, then removes it.
 *   3. Returns success or error based on update results.
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK (member added or removed):
 *     {
 *       message: "Member added successfully"
 *     }
 *     or
 *     {
 *       message: "Member removed successfully"
 *     }
 *
 *   • 400 Bad Request (invalid action or attempt to remove creator):
 *     {
 *       error: "Invalid action. Supported actions: add_member, remove_member"
 *     }
 *     or
 *     {
 *       error: "Cannot remove board creator"
 *     }
 *
 *   • 404 Not Found (board does not exist):
 *     {
 *       error: "Board not found"
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<BoardParams> }
) {
  try {
    const { boardId } = await params;
    const body = await req.json();
    const { action, userId } = body;

    await connectDB();

    // Should prob make sure user exists, can eventually change creator.

    switch (action) {
      case "add_member":
        const addResult = await Board.updateOne(
          { _id: boardId },
          { $addToSet: { members: userId } }
        );

        if (addResult.matchedCount === 0) {
          return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        return NextResponse.json(
          { message: "Member added successfully" },
          { status: 200 }
        );

      case "remove_member":
        // First check if the board exists and get the creator
        const board = await Board.findOne({ _id: boardId });

        if (!board) {
          return NextResponse.json({ error: "Board not found" }, { status: 404 });
        }

        // Prevent removing the board creator
        if (board.createdBy.equals(userId)) {
          return NextResponse.json(
            { error: "Cannot remove board creator" },
            { status: 400 }
          );
        }

        await Board.updateOne({ _id: boardId }, { $pull: { members: userId } });

        return NextResponse.json(
          { message: "Member removed successfully" },
          { status: 200 }
        );

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: add_member, remove_member" },
          { status: 400 }
        );
    }
  } catch (err) {
    return handleServerError(err);
  }
}
