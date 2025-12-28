import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  try {
    await client.connect();
    console.log("connected");

    const deleteData = await request.json();
    console.log("Deleting:", deleteData);

    // Convert _id string to ObjectId
    if (deleteData._id) {
      deleteData._id = new ObjectId(deleteData._id);
    }

    const result = await client.db("shop").collection("Inventory").deleteOne(deleteData);
    console.log("Deleted count:", result.deletedCount);

    return NextResponse.json({ message: "Deleted successfully", deletedCount: result.deletedCount }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
