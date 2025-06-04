import { authOptions } from "@/auth";
import Board from "@/db/models/Board";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// const BoardSchema = new Schema<IBoard>({
//   title: { type: String, required: true },
//   description: { type: String },
//   members: [{ type: Schema.Types.ObjectId, ref: "User" }],
//   createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
// });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await connectDB();

    const boards = await Board.find({ members: userId });

    return NextResponse.json(
      { message: "Successfully retrieved boards for user.", boards },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

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
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
