import Navbar from "@/app/components/NavigationBars/Navbar";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import TaskDisplay from "./components/Task/TaskDisplay";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/"); // AuthAuth2@
  }

  return (
    <div>
      <Navbar />

      <TaskDisplay />
    </div>
  );
}
