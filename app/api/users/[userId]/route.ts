import User from "@/db/models/User";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface UserParams {
  userId: string;
}

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
