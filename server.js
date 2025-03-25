const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodeCron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/todoapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Task Schema & Model
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    category: { type: String, enum: ["Work", "Personal", "Urgent", "Other"], default: "Other" },
    recurring: { type: String, enum: ["None", "Daily", "Weekly", "Monthly"], default: "None" },
    createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model("Task", taskSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ GET /tasks - Fetch All Tasks with Filters & Sorting
app.get("/tasks", async (req, res) => {
    const { completed, category, search, sortBy, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (completed !== undefined) filter.completed = completed === "true";
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const sortOptions = {};
    if (sortBy === "dueDate") sortOptions.dueDate = 1;
    else if (sortBy === "createdAt") sortOptions.createdAt = -1;

    const tasks = await Task.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit));
    res.json(tasks);
});

// ✅ GET /tasks/:id - Fetch a Specific Task
app.get("/tasks/:id", async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
});

// ✅ POST /tasks - Add a New Task
app.post("/tasks", async (req, res) => {
    const { title, completed, dueDate, category, recurring } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const newTask = new Task({ title, completed: completed || false, dueDate, category, recurring });
    await newTask.save();
    res.status(201).json(newTask);
});

// ✅ PUT /tasks/:id - Update a Task
app.put("/tasks/:id", async (req, res) => {
    const { title, completed, dueDate, category, recurring } = req.body;
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, completed, dueDate, category, recurring },
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

// ✅ PATCH /tasks/complete-all - Mark All Tasks as Completed
app.patch("/tasks/complete-all", async (req, res) => {
    await Task.updateMany({}, { completed: true });
    res.json({ message: "All tasks marked as completed" });
});

// ✅ Task Reminder Notifications (Runs every hour)
nodeCron.schedule("0 * * * *", async () => {
    const now = new Date();
    const upcomingTasks = await Task.find({
        dueDate: { $gte: now, $lt: new Date(now.getTime() + 60 * 60 * 1000) },
        completed: false
    });
    upcomingTasks.forEach(task => {
        console.log(`🔔 Reminder: Task "${task.title}" is due soon!`);
    });
});

// ✅ Recurring Task Automation (Runs daily at midnight)
nodeCron.schedule("0 0 * * *", async () => {
    const tasks = await Task.find({ recurring: { $ne: "None" } });
    tasks.forEach(async (task) => {
        let newDueDate = new Date(task.dueDate);
        if (task.recurring === "Daily") newDueDate.setDate(newDueDate.getDate() + 1);
        else if (task.recurring === "Weekly") newDueDate.setDate(newDueDate.getDate() + 7);
        else if (task.recurring === "Monthly") newDueDate.setMonth(newDueDate.getMonth() + 1);

        const newTask = new Task({
            title: task.title,
            completed: false,
            dueDate: newDueDate,
            category: task.category,
            recurring: task.recurring,
        });
        await newTask.save();
    });
    console.log("🔄 Recurring tasks have been generated.");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
