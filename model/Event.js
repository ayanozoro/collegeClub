import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true }, // startDate from frontend
  endDate: { type: Date }, // new field for endDate
  category: String, // e.g., workshop, seminar, conference
  type: String, // e.g., tech, cultural, sports
  mode: String, // online or offline
  venue: String, // venue or Google Maps link
  instagram: String, // social media URL
  linkedin: String, // social media URL
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  eventType: { type: String, required: true },
  image: String, // poster image URL
  certificatePdf: String, // URL to uploaded PDF certificate
  certificateImage: String, // URL to uploaded image certificate
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});


export default mongoose.models.Event || mongoose.model("Event", EventSchema);
