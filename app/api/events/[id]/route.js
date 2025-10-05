import dbConnect from "@/lib/mongodb";
import Event from "@/model/Event";
import Club from "@/model/Club";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const event = await Event.findById(id).populate("club");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const event = await Event.findById(id).populate("club");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ clerkId: userId });
    if (!user || event.club.admin.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden: Only club admin can delete events" }, { status: 403 });
    }

    // Delete the event
    await Event.findByIdAndDelete(id);

    // Remove from club's events array
    await Club.findByIdAndUpdate(event.club._id, { $pull: { events: id } });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
