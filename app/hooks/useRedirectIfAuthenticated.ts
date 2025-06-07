import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * If the user is already signed in, redirect them away.
 * @param redirectTo  Path to send them to (defaults to "/")
 */
export function useRedirectIfAuthenticated(redirectTo = "/") {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(redirectTo);
    }
  }, [status, redirectTo, router]);
}
