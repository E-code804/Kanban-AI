import User from "@/db/models/User";
import { handleServerError } from "@/lib/Backend/errorHandler";
import { connectDB } from "@/lib/Backend/mongodb";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * Register a new user by hashing their password and storing their details in the database.
 *
 * @param req - A NextRequest whose JSON body must include:
 *   - name: string (the user’s full name)
 *   - email: string (the user’s desired email address)
 *   - password: string (the plaintext password to be hashed)
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 201 Created:
 *     {
 *       message: "New user successfully created",
 *       id: "<MongoDB ObjectId of the new user>"
 *     }
 *
 *   • 400 Bad Request (missing fields):
 *     {
 *       message: "Missing fields."
 *     }
 *
 *   • 409 Conflict (email already in use):
 *     {
 *       message: "User already exists with this email."
 *     }
 *
 *   • 500 Internal Server Error (unexpected exception):
 *     {
 *       error: "<Error message or generic fallback>",
 *       status: 500
 *     }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists with this email." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await User.insertOne({ name, email, password: hashedPassword });

    return NextResponse.json(
      { message: "New user sucessfully created", id: newUser.insertedId },
      { status: 201 }
    );
  } catch (err) {
    return handleServerError(err);
  }
}
