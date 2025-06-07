import { useTask } from "@/app/hooks/useTaskContext";
import { Loader2 } from "lucide-react";
import { Types } from "mongoose";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface MemberType {
  _id: Types.ObjectId;
  name: string;
}

const TaskForm = () => {
  const router = useRouter();
  const [taskDescription, setTaskDescription] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<MemberType[]>();
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { dispatch } = useTask();

  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await fetch(`/api/kanban/boards/684106955094cc7a5ee4e026`);
        if (!response.ok) {
          console.error("Failed to fetch board members");
          return;
        }
        const data = await response.json();
        setMembers(data.board.members);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };

    // if (state.boardId) {
    //   getMembers();
    // }
    getMembers();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!taskDescription?.trim())
      newErrors.taskDescription = "Task description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) return;

    console.log(taskDescription, selectedMember);
    try {
      const prompt = `${taskDescription}. Assign to ${selectedMember}`;
      const response = await fetch(
        "/api/kanban/boards/684106955094cc7a5ee4e026/task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: prompt,
          }),
        }
      );

      if (!response.ok) {
        setErrors({ submit: "Something went wrong" });
        return;
      }

      const data = await response.json();
      const { task } = data;
      // add a dispatch to add the new task.
      dispatch({ type: "ADD_TASK", payload: { task } });
      router.push("/");
    } catch (error) {
      setErrors({ submit: `Network error. Please try again. ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              Create New Task
            </h1>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Add a new task and assign it to a team member
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task description Field */}
            <div>
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Task Description
              </label>
              <div className="relative">
                <textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none ${
                    errors.taskDescription
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>
              {errors.taskDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.taskDescription}</p>
              )}
            </div>

            {/* Assign To field */}
            <div>
              <label
                htmlFor="memberSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assign to:
              </label>
              <select
                id="memberSelect"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.member
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  -- Select a member --
                </option>
                {members &&
                  members.map((member: MemberType) => (
                    <option
                      key={member._id.toString()}
                      value={member._id.toString()}
                    >
                      {member.name}
                    </option>
                  ))}
              </select>
              {errors.member && (
                <p className="mt-1 text-sm text-red-600">{errors.member}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Creating Task...
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
