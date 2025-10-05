import dbConnect from "@/lib/mongodb";
import Event from "../../../../model/Event";
import User from "../../../../model/User";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user document by clerkId
  const userDoc = await User.findOne({ clerkId: user.id });
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find events where user is the admin of the club that created the event
  const events = await Event.find({}).populate({
    path: 'club',
    match: { admin: userDoc._id }
  }).populate('attendees', 'name email').then(events => events.filter(event => event.club !== null));
  return NextResponse.json(events);
}
