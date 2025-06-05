import { Board } from "@/types/board";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Actions from "./Actions";
import NavLinks from "./NavLinks";
import UserBoards from "./UserBoards";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { data: session } = useSession();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBoards = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/kanban/boards");

        if (!response.ok) {
          console.log("An error occurred fetching boards.");
          return;
        }

        const json = await response.json();
        setBoards(json.boards || []);
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserBoards();
    }
  }, [session]);

  return (
    <div className="w-80 h-full bg-white shadow-2xl border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        {/* Logo and welcoming user */}
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-3">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-sm"></div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Kanban AI</h2>
            <p className="text-sm text-gray-600">
              Welcome, {session?.user?.name || "User"}!
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors duration-200 cursor-pointer"
          aria-label="Close menu"
        >
          {/* "X" button */}
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <Actions />

        {/* User's Boards */}
        <UserBoards loading={loading} boards={boards} />

        {/* Navigation Links */}
        <NavLinks />
      </div>
    </div>
  );
};

export default Sidebar;
