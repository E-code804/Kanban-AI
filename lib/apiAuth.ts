import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

// Ensure the current user has a valid session.
export async function requireUserSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return session.user.id;
}
