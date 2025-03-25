const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/todoapp")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Task Schema & Model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, default: null }
});

const Task = mongoose.model("Task", taskSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ GET /tasks - Fetch All Tasks
app.get("/tasks", async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

// ✅ POST /tasks - Add a New Task
app.post("/tasks", async (req, res) => {
    const { title, completed, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = new Task({ title, completed: completed || false, dueDate });
    await newTask.save();
    res.status(201).json(newTask);
});

// ✅ PUT /tasks/:id - Update a Task
app.put("/tasks/:id", async (req, res) => {
    const { title, completed, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, completed, dueDate },
        { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
});

// ✅ DELETE /tasks/:id - Delete a Task
app.delete("/tasks/:id", async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
