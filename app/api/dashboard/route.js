import dbConnect from "@/lib/mongodb";
import Club from "../../../model/Club";
import Event from "../../../model/Event";
import User from "../../../model/User";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  await dbConnect();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find user in DB
  const userDoc = await User.findOne({ clerkId: user.id });
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get clubs where user is admin
  const clubs = await Club.find({ admin: userDoc._id }).populate('members', 'name email');

  // Get events where club.admin is userDoc._id
  const events = await Event.find({}).populate({
    path: 'club',
    match: { admin: userDoc._id }
  }).populate('attendees', 'name email');

  // Filter events where club is not null (since populate with match)
  const filteredEvents = events.filter(event => event.club);

  return NextResponse.json({ clubs, events: filteredEvents });
}
