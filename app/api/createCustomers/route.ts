import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";


export async function POST(request: Request) {
  if(process.env.MONGODB_URI){
const client = new MongoClient(process.env.MONGODB_URI!,  {
        
    }
);
  try {
    await client.connect();
    console.log("connected");
    const nameCollection = await request.json()
    await client.db("shop").createCollection(`${nameCollection}`);
return NextResponse.json(
      { message: "heyy" },
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
}
