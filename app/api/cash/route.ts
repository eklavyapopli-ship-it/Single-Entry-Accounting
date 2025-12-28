import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET() {
  try {
    await client.connect();
    const cashCollection = client.db("shop").collection("Cash");
    const data = await cashCollection.find({}).toArray();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const cashCollection = client.db("shop").collection("Cash");
    const result = await cashCollection.insertOne(body);
    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const cashCollection = client.db("shop").collection("Cash");
    await cashCollection.deleteOne({ _id: new ObjectId(body._id) });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await client.connect();
    const body = await request.json();
    const cashCollection = client.db("shop").collection("Cash");
    const { _id, ...updateData } = body;
    await cashCollection.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
