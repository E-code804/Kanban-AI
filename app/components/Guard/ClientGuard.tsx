"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardClientGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // If not logged in, send them to login with callbackUrl
      signIn("credentials", { callbackUrl: "/dashboard" });
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // or a spinner
  }

  if (!session) {
    // While NextAuth is redirecting them, show nothing or a loader
    return <p>Redirecting to login…</p>;
  }

  // If session exists, render the protected children
  return <>{children}</>;
}
