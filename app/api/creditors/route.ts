import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET() {
  try {
    await client.connect();
    const data = await client.db("shop").collection("Creditors").find({}).toArray();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    await client.db("shop").collection("Creditors").insertOne(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    await client.db("shop").collection("Creditors").deleteOne({ _id: body._id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const { _id, ...rest } = body;
    await client.db("shop").collection("Creditors").updateOne(
      { _id },
      { $set: rest }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
