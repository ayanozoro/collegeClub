import dbConnect from "@/lib/mongodb";
import Club from "../../../model/Club";
import User from "../../../model/User";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  await dbConnect();
  const { clerkId, clubId } = await req.json();

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

  // Check if already joined
  if (user.joinedClubs.includes(clubId)) {
    return NextResponse.json({ message: "Already joined the club!" });
  }

  // Add user to club
  await Club.findByIdAndUpdate(clubId, { $push: { members: user._id } });
  await User.findByIdAndUpdate(user._id, { $push: { joinedClubs: clubId } });

  return NextResponse.json({ message: "User joined the club successfully!" });
}
