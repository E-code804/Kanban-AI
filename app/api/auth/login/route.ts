import User from "@/db/models/User";
import { handleServerError } from "@/lib/errorHandler";
import { connectDB } from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * Authenticate a user by verifying email and password against the database.
 *
 * @param req - A NextRequest whose JSON body must include:
 *   - email: string (the user’s registered email address)
 *   - password: string (the plaintext password to compare)
 *
 * @returns NextResponse containing a JSON object. Possible responses:
 *   • 200 OK:
 *     {
 *       message: "Successfully logged in.",
 *       id: "<MongoDB ObjectId of the user>"
 *     }
 *
 *   • 400 Bad Request (missing fields):
 *     {
 *       message: "Missing fields."
 *     }
 *
 *   • 401 Unauthorized (invalid credentials):
 *     {
 *       message: "Invalid credentials."
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
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Missing fields." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
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
    return handleServerError(err);
  }
}
