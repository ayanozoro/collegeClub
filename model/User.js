import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, required: true },
  name: String,
  email: { type: String, unique: true },
  joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
