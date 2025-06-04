import { useSession } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession();

  return (
    <div className="text-black">Welcome {session ? session.user.name : "User"}</div>
  );
};

export default Sidebar;
