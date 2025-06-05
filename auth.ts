import { connectDB } from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { compare } from "bcryptjs";
import { MongoClient } from "mongodb";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "./db/models/User";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
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

        await connectDB();
        const user = await User.findOne({ email });
        if (!user) return null;

        const userObj = user.toObject();
        const isValid = await compare(password, userObj.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
    // any additional providers…
  ],
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
