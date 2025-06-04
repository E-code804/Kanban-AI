import { authOptions } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// const BoardSchema = new Schema<IBoard>({
//   title: { type: String, required: true },
//   description: { type: String },
//   members: [{ type: Schema.Types.ObjectId, ref: "User" }],
//   createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
// }); check somehwere to make sure a user cannot join a board twice.
// await db.collection("boards").updateOne(
//   { _id: boardId },
//   { $addToSet: { members: userId } } // Only adds if not already present
// );

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);

    const client = await clientPromise;
    const db = client.db();

    const boards = await db.collection("boards").find({ members: userId }).toArray();

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

    const userId = new ObjectId(session.user.id);

    if (!title?.trim()) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newBoard = {
      title,
      description: description || "",
      members: [userId],
      createdBy: userId,
      createdAt: new Date(),
    };
    const result = await db.collection("boards").insertOne(newBoard);

    return NextResponse.json(
      { boardId: result.insertedId, ...newBoard },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
