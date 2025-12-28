import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";


export async function GET(request: Request) {
  if(process.env.MONGODB_URI){
 const client = new MongoClient(process.env.MONGODB_URI!,  {
    }
);
const excludedCollections = ['Cash', 'Inventory', "Miscellaneous"];
  try {
    await client.connect();
    console.log("connected");
   const collections = await client.db("shop").listCollections({}).toArray();
   const data = collections.filter(collection => {
    return !excludedCollections.includes(collection.name);
});
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
 
}
