import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";



export async function POST(request: Request) {
  if(process.env.MONGODB_URI){


  const client = new MongoClient(process.env.MONGODB_URI!);
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

    const result = await client.db("shop").collection(`${path}`).deleteOne(deleteData);
    console.log("Deleted count:", result.deletedCount);

    return NextResponse.json({ message: "Deleted successfully", deletedCount: result.deletedCount }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
    }
}
