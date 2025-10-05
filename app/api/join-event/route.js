import dbConnect from "@/lib/mongodb";
import Event from "../../../model/Event";
import User from "../../../model/User";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  await dbConnect();
  const { clerkId, eventId } = await req.json();

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find or create user by clerkId
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = await User.create({
      clerkId,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });
  }
 // Check if already registered
  if (user.joinedEvents.includes(eventId)) {
    return NextResponse.json({ message: "Already registered for the event!" });
  }

  // Add user to event attendees
  await Event.findByIdAndUpdate(eventId, { $push: { attendees: user._id } });
  await User.findByIdAndUpdate(user._id, { $push: { joinedEvents: eventId } });

  return NextResponse.json({ message: "User registered for the event successfully!" });
}
