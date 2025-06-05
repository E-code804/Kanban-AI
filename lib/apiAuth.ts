// import { authOptions } from "@/auth";
// import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Ensure the current user has a valid session.
// export async function requireUserSession() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return null;
//   }

//   return session.user.id;
// }

export async function getUserId(req: Request) {
  const token = await getToken({
    req: req as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Pull the userId out of the token payload
  const userId = token?.id as string;
  return userId;
}
