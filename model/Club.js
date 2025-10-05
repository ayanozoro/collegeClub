import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admin : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  college:{type: String},
  fee: { type: Number, default: 0 },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  image: String,
  organizer: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  category: { type: String, required: true },
  type: { type: String, required: true },
  venue: { type: String },
  instagram: { type: String },
  linkedin: { type: String }
});

export default mongoose.models.Club || mongoose.model("Club", ClubSchema);
