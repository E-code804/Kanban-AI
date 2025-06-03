import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists with this email." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await db
      .collection("users")
      .insertOne({ name, email, password: hashedPassword });

    return NextResponse.json(
      { message: "New user sucessfully created", id: newUser.insertedId },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "An unknown error occurred",
      status: 500,
    });
  }
}
