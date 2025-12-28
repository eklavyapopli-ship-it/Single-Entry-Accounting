import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: Request) {
  try {
    await client.connect();
    const { item_name, quantity_sold, value_sold } = await request.json();

    const collection = client.db("shop").collection("Inventory");

    // Find the inventory item
    const item = await collection.findOne({ item_name });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Calculate new value
    const newValue = Number(item.value) - Number(value_sold);

    // Update inventory
    await collection.updateOne(
      { _id: item._id },
      { $set: { value: newValue } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
