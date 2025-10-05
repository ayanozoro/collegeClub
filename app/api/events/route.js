import dbConnect from "@/lib/mongodb";
import Event from "@/model/Event";
import Club from "@/model/Club";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { auth ,currentUser } from "@clerk/nextjs/server";
import multer from "multer";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

// GET all events
export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const college = searchParams.get('college');
  const eventType = searchParams.get('eventType');
  const type = searchParams.get('type');
  const sort = searchParams.get('sort');
  let filter = {};
  if (college) {
    filter['club.college'] = college;
  }
  if (eventType) {
    filter['eventType'] = eventType;
  }
  if (type) {
    filter['type'] = type;
  }
  const sortOrder = sort === 'old' ? 1 : -1; // recent is -1, old is 1, default recent
  const events = await Event.find(filter).populate("club").sort({ date: sortOrder });
  return NextResponse.json(events);
}

// POST create event
export async function POST(req) {
  await dbConnect();

  const { userId } = await auth();   // gets userId from JWT in cookies/headers
  console.log('userId from auth():', userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find or create user in MongoDB
  let userDoc = await User.findOne({ clerkId: userId });
  if (!userDoc) {
    const clerkUser = await currentUser(); // heavier call
    userDoc = await User.create({
      clerkId: clerkUser.id,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress,
    });
  }

  const formData = await req.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  // const date = formData.get("date");
  const clubId = formData.get("clubId");
  const file = formData.get("image"); // file object from <input type="file" />
  const date = formData.get("startDate");
  // Add after existing gets
const endDate = formData.get("endDate");
const category = formData.get("category");
const type = formData.get("type");
const mode = formData.get("mode"); // eventMode from frontend
const venue = formData.get("venue");
const instagram = formData.get("instagram");
const linkedin = formData.get("linkedin");

  if (!title || !description || !date || !category || !type) {
    return NextResponse.json(
      { error: "Title, description, startDate, category, and type are required" },
      { status: 400 }
    );
  }


  let club = null;
  if (clubId && clubId !== "") {
    club = await Club.findById(clubId);
    if (!club || !club.admin.equals(userDoc._id)) {
      return NextResponse.json(
        { error: "Not authorized to create event for this club" },
        { status: 403 }
      );
    }
  }

  let imageUrl = null;
  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  }


  const newEvent = await Event.create({
  title,
  description,
  date,
  endDate: endDate ? new Date(endDate) : null,
  category,
  type,
  mode,
  venue,
  instagram,
  linkedin,
  club: clubId || null,
  eventType: clubId ? "Club Event" : "Individual Event",
  image: imageUrl,
});


  if (clubId) {
    await Club.findByIdAndUpdate(clubId, {
      $push: { events: newEvent._id },
    });
  }

  return NextResponse.json(newEvent, { status: 201 });
}



