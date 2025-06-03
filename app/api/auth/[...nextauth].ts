import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { compare } from "bcryptjs"; // if you hash passwords
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb"; // see below

export default NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;

        // 1) Connect to your Users collection via Mongoose or MongoClient:
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email });
        if (!user) return null;

        // 2) Check hashed password:
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        // 3) Return a minimal user object to NextAuth:
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
    // (Optional) Add GitHubProvider, GoogleProvider, etc.
  ],
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token, user }) {
      // Include user.id in session for client side
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
