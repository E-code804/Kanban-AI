import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const passwordCompare = await compare(password, user.password);
    if (!passwordCompare) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Successfully logged in.", id: user._id },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
