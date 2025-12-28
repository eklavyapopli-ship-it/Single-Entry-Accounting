import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";


export async function GET() {
if(process.env.MONGODB_URI){
const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const data = await client.db("shop").collection("Miscellaneous").find({}).toArray();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
}

export async function POST(request: Request) {
if(process.env.MONGODB_URI){
const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const body = await request.json();
    await client.db("shop").collection("Miscellaneous").insertOne(body);
    await client.db("shop").collection("Cash").insertOne({type:body.type, amount: body.amount})
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
}

export async function DELETE(request: Request) {
  if(process.env.MONGODB_URI){

const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const body = await request.json();
    await client.db("shop").collection("Miscellaneous").deleteOne({ _id: new ObjectId(body._id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
}

export async function PUT(request: Request) {
  if(process.env.MONGODB_URI){

const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const body = await request.json();
    const { _id, ...rest } = body;
    await client.db("shop").collection("Miscellaneous").updateOne(
      { _id },
      { $set: rest }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
}
