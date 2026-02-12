const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// MongoDB connection (NO deprecated options)
mongoose
  .connect("mongodb://127.0.0.1:27017/devops2026")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Event schema
const eventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  location: String,
});

const Event = mongoose.model("Event", eventSchema);

// ✅ EVENTS ROUTE
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});