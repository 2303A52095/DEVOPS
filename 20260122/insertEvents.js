const mongoose = require("mongoose");

// Connect to MongoDB (NO options)
mongoose
  .connect("mongodb://127.0.0.1:27017/devops2026")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Example Event schema
const eventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  location: String,
});

const Event = mongoose.model("Event", eventSchema);

// Insert data
async function insertEvents() {
  try {
    await Event.insertMany([
      {
        name: "DevOps Workshop",
        date: new Date(),
        location: "Hyderabad",
      },
      {
        name: "Cloud Seminar",
        date: new Date(),
        location: "Bangalore",
      },
    ]);

    console.log("Events inserted successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Insert error:", err);
    mongoose.connection.close();
  }
}

insertEvents();
