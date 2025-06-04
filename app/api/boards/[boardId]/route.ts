import { authOptions } from "@/auth";
import Board from "@/db/models/Board";
import { connectDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const { boardId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await connectDB();

    const board = await Board.findById(boardId);

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // checking for membership in this board
    const isMemeber = board.members.some((m: ObjectId) => m.toString() == userId);
    if (!isMemeber) {
      return NextResponse.json({ message: "User not in board" }, { status: 403 });
    }

    return NextResponse.json({ message: "Found board", board }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    const { userId } = body;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // First check to ensure the requestor is the creator of the board
    const board = await Board.findOne({ _id: boardId });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Prevent removing the board creator
    if (!board.createdBy.equals(userId)) {
      return NextResponse.json(
        { error: "Cannot delete board if you are not the creator" },
        { status: 400 }
      );
    }

    const deleteResult = await Board.deleteOne({ _id: boardId });
    if (deleteResult.deletedCount === 1) {
      return NextResponse.json(
        { message: "Board deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Board deleted UNsuccessfully" },
        { status: 404 }
      );
    }
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const { boardId } = await params;
    const body = await request.json();
    const { action, userId } = body;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
