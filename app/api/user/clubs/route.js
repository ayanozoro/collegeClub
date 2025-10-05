import dbConnect from "@/lib/mongodb";
import Club from "@/model/Club.js";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import User from "@/model/User";
import multer from "multer";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";

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

  // Find clubs where user is the admin
  const clubs = await Club.find({ admin: userDoc._id }).populate('members', 'name email');
  return NextResponse.json(clubs);
}

export async function POST(req) {
  await dbConnect();

  // Get currently authenticated user
  const { userId } = await auth();
  console.log('userId from auth():', userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find or create the user
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      const clerkUser = await currentUser();
      user = await User.create({
        clerkId: userId,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.emailAddresses[0].emailAddress,
      });
    }

    const formData = await req.formData();
    const {
      fullName,
      email,
      phone,
      name,
      description,
      category,
      type,
      college,
      fee,
      venue,
      instagram,
      linkedin,
    } = Object.fromEntries(formData);

    if (!name || !description || !college || !fullName || !email || !phone || !category || !type) {
      return NextResponse.json({ error: "Required fields missing: name, description, college, fullName, email, phone, category, type" }, { status: 400 });
    }

    const clubImage = formData.get('clubImage');
    let imageUrl = null;
    if (clubImage && clubImage.size > 0) {
      const bytes = await clubImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    // Set the current user as admin
    const newClub = await Club.create({
      name,
      admin: user._id, // Use the User's _id
      description,
      college,
      fee: parseInt(fee) || 0,
      image: imageUrl,
      events: [],
      members: [],
      organizer: {
        fullName,
        email,
        phone
      },
      category,
      type,
      venue: venue || null,
      instagram: instagram || null,
      linkedin: linkedin || null
    });

    return NextResponse.json(newClub, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json({ error: "Failed to create club" }, { status: 500 });
  }
}
