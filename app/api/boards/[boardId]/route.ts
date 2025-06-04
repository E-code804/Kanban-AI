import { authOptions } from "@/auth";
import Board from "@/db/models/Board";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
