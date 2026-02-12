const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// MongoDB connection (NO deprecated options)
mongoose
  .connect("mongodb://localhost:27017/devops2026", {
    serverSelectionTimeoutMS: 5000,
  })
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

// Test route with events display
app.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    let html = "<h1>Server is running</h1><h2>Events:</h2>";
    if (events.length > 0) {
      html += "<ul>";
      events.forEach(event => {
        html += `<li><strong>${event.name}</strong> - ${event.date} - ${event.location}</li>`;
      });
      html += "</ul>";
    } else {
      html += "<p>No events found</p>";
    }
    res.send(html);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});