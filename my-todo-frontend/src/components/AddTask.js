
import { useState } from "react";

const AddTask = ({ onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return; // Prevent empty tasks
    onAdd(title);
    setTitle(""); // Clear input after adding
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task"
        className="border border-gray-300 p-2 rounded w-full text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
