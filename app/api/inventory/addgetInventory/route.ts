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
    const inventoryData = await request.json()
    await client.db("shop").collection("Inventory").insertOne(inventoryData);
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
export async function GET(request: Request) {
  if(process.env.MONGODB_URI){
  const client = new MongoClient(process.env.MONGODB_URI!,  {
        
    }
);
  try {
    await client.connect();
    console.log("connected");
   const collections = await client.db("shop").collection("Inventory").find({}).toArray()
 return NextResponse.json(
      { success: true, collections },
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

