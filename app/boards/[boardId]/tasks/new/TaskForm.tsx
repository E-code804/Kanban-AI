// import { useTask } from "@/app/hooks/useTaskContext";
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
  // const { state } = useTask();

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

      router.push("/");
    } catch (error) {
      setErrors({ submit: `Network error. Please try again. ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task description Field */}
        <div>
          <label htmlFor="task-description" className="form-label">
            Task Description
          </label>
          <div className="relative">
            <input
              id="task-description"
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className={errors.name ? "input-field-error" : "input-field"}
              placeholder="Enter task"
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
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4"
          >
            <option value="" disabled>
              -- Select a member --
            </option>
            {members &&
              members.map((member: MemberType) => (
                <option key={member._id.toString()} value={member._id.toString()}>
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
        <button type="submit" disabled={isLoading} className="submit-btn">
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
  );
};

export default TaskForm;
