import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // to specify revalidation interval

// Helper function to connect to the database
const connectToDatabase = async () => {
  const client = await clientPromise;
  return client.db("cloud");
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => ObjectId.isValid(id);

// POST: Update user information by ID
export async function POST(req) {
  try {
    const { id, name, email, password } = await req.json();

    // Validate ID
    if (!id) {
      return new Response(JSON.stringify({ message: "ID is required" }), { status: 400 });
    }

    // Convert the string ID to ObjectId if it's valid
    const objectId = isValidObjectId(id) ? new ObjectId(id) : null;
    if (!objectId) {
      return new Response(JSON.stringify({ message: "Invalid ID format" }), { status: 400 });
    }

    // Prepare the update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ message: "No fields to update" }), { status: 400 });
    }

    const db = await connectToDatabase();

    // Perform the update operation
    const result = await db.collection("users").updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    // Check if the user was updated successfully
    if (result.modifiedCount > 0) {
      return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: "No changes made or user not found" }), { status: 400 });
    }

  } catch (error) {
    console.error("Error updating user:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
