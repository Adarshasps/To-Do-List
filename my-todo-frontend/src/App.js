import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Import motion for animations
import { getTasks, addTask, deleteTask, updateTask } from "./api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null); // ✅ Ref for keeping focus

  useEffect(() => {
    getTasks()
      .then((response) => {
        setTasks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-gray-900", "text-white");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-gray-900", "text-white");
      document.body.classList.add("bg-gray-50", "text-gray-900");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleAddTask = () => {
    if (!title) return;
    addTask({ title, completed: false }).then((response) => {
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setTitle("");
      inputRef.current.focus(); // ✅ Keep cursor in input field
    });
  };

  const handleDeleteTask = (id) => {
    deleteTask(id).then(() => {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    });
  };

  const handleToggleComplete = (task) => {
    updateTask(task._id, { completed: !task.completed }).then((response) => {
      setTasks((prevTasks) => prevTasks.map((t) => (t._id === task._id ? response.data : t)));
    });
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setEditedTitle(task.title);
  };

  const handleSaveEdit = (id) => {
    updateTask(id, { title: editedTitle }).then((response) => {
      setTasks((prevTasks) => prevTasks.map((task) => (task._id === id ? response.data : task)));
      setEditingTaskId(null);
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">To-Do List</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Task Input */}
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          value={title}
          ref={inputRef} // ✅ Attach input ref
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task"
          className="border p-3 rounded-lg w-full bg-white dark:bg-gray-800 dark:text-white text-lg transition-all"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition-all"
        >
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter("all")}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          All
        </button>
        <button
          onClick={() => setFilter("completed")}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("pending")}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
        >
          Pending
        </button>
      </div>

      {/* Show loading message while fetching data */}
      {loading ? (
        <p className="text-center text-lg">Loading tasks...</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence> {/* ✅ Enables exit animations */}
            {filteredTasks.map((task) => (
              <motion.li
                key={task._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between border p-4 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-all"
              >
                {editingTaskId === task._id ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="border p-2 rounded dark:bg-gray-800 dark:text-white transition-all w-full"
                  />
                ) : (
                  <span className={`text-lg ${task.completed ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </span>
                )}

                <div className="flex gap-2">
                  {editingTaskId === task._id ? (
                    <button
                      onClick={() => handleSaveEdit(task._id)}
                      className="px-3 py-2 text-green-600 hover:text-green-700 transition-all"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`px-3 py-2 ${
                          task.completed
                            ? "text-gray-500 hover:text-gray-600"
                            : "text-green-500 hover:text-green-600"
                        } transition-all`}
                      >
                        {task.completed ? "Undo" : "Done"}
                      </button>
                      <button
                        onClick={() => handleEditClick(task)}
                        className="px-3 py-2 text-yellow-500 hover:text-yellow-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="px-3 py-2 text-red-500 hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export default App;
