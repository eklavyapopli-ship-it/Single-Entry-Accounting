import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!,  {
        
    }
);
export async function GET(request: Request) {
const { searchParams } = new URL(request.url);
 const path = searchParams.get("path");
  try {
    await client.connect();
    console.log("connected");
   const data = await client.db("shop").collection(`${path}`).find({}).toArray()
 return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
