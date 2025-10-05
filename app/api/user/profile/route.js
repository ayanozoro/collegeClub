import dbConnect from "@/lib/mongodb";
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

  return NextResponse.json(userDoc);
}

export async function PUT(req) {
  await dbConnect();
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  // Update the user document
  const updatedUser = await User.findOneAndUpdate(
    { clerkId: user.id },
    { name },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(updatedUser);
}
