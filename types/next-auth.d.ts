// types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * 1) Augment the `Session` interface so that `session.user.id` is available.
 *    We extend DefaultSession and overwrite `user` to include `id: string`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      /** Add your custom user fields here */
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // any other custom field, e.g. role?: string;
    };
  }

  /**
   * 2) (Optional) You can also augment `User` if you want to add any custom fields
   *    on the database User object. This is not strictly required just for session.id,
   *    but it can be helpful if you want `user.id` or `user.role` typed elsewhere.
   */
  interface User extends DefaultUser {
    id: string;
    // role?: string;
    // any other custom user property you are storing
  }
}

/**
 * 3) Augment the `JWT` interface so that `token.id` is available.
 *    We extend DefaultJWT and add `id: string`. This reflects what you do in your
 *    `callbacks.jwt({ token, user }) → token.id = user.id`.
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    // role?: string;
  }
}
