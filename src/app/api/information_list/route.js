import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/";
const client = new MongoClient(uri);
export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // to specify revalidation interval


export async function GET() {
  try {
    await client.connect();
    const db = client.db('cloud');
    const collection = db.collection('mega_personal_login');

    const data = await collection.find({}).toArray();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  } finally {
    await client.close();
  }
}


export async function DELETE(request) {

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    await client.connect();
    const db = client.db('cloud');
    const linksCollection = db.collection("mega_personal_login");

    const result = await linksCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "No document found with the provided ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Link deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { message: "Error deleting link", error: error.message },
      { status: 500 }
    );
  }
}
