import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";



export async function POST(request: Request) {
  if(process.env.MONGODB_URI){
  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();

    const { item_name, value_sold } = await request.json();

    if (!item_name) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const collection = client.db("shop").collection("Inventory");

    const item = await collection.findOne({ item_name });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

   
    await collection.updateOne(
      { item_name },
      {
        $inc: {
          value: -Number(value_sold || 0),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
}
