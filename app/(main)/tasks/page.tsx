"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { X, Plus } from "lucide-react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  date: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const { user } = useUser();

  const API = "http://localhost:8080/api/tasks";

  //  Fetch all tasks
  const fetchTasks = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${API}/${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  //  Fetch tasks by date
  const fetchByDate = async (selectedDate: string) => {
    if (!user?.id || !selectedDate) return;

    try {
      const res = await fetch(`${API}/${user.id}/${selectedDate}`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks by date:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  //  Add task
  const addTask = async () => {
    if (!title || !date || !user?.id) return;

    try {
      await fetch(`${API}/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          completed: false,
          date,
        }),
      });

      setTitle("");
      setDate("");
      fetchTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  // Toggle complete
  const toggleTask = async (task: Task) => {
    try {
      await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed,
        }),
      });

      fetchTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Delete task
  const deleteTask = async (id: number) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

      {/* Add Task */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task..."
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={addTask}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {/* Filter by date */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by date:
        </label>
        <input
          type="date"
          onChange={(e) => {
            if (e.target.value) {
              fetchByDate(e.target.value);
            } else {
              fetchTasks();
            }
          }}
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-8">No tasks found</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <p
                onClick={() => toggleTask(task)}
                className={`cursor-pointer text-lg ${
                  task.completed ? "line-through text-gray-400" : "text-gray-800"
                }`}
              >
                {task.title}
              </p>

              <span className="text-sm text-gray-500">{task.date}</span>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
