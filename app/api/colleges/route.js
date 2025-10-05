import dbConnect from "@/lib/mongodb";
import College from "@/model/College.js";
import { NextResponse } from "next/server";

// GET colleges with optional search query
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  let colleges;
  if (query) {
    colleges = await College.find({ name: { $regex: query, $options: 'i' } }).limit(10);
  } else {
    colleges = await College.find().limit(50);
  }

  return NextResponse.json(colleges);
}

// POST to add a new college (optional, for admin)
export async function POST(req) {
  await dbConnect();
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "College name is required" }, { status: 400 });
  }

  try {
    const newCollege = await College.create({ name });
    return NextResponse.json(newCollege, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "College already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create college" }, { status: 500 });
  }
}
