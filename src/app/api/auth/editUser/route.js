import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { id, name, email, password } = await req.json();
        console.log("Received ID:", id);

        if (!id) {
            return new Response(JSON.stringify({ message: "ID is required" }), { status: 400 });
        }

        // Convert the string ID to ObjectId if it's not already
        const objectId = ObjectId.isValid(id) ? new ObjectId(id) : null;
        if (!objectId) {
            return new Response(JSON.stringify({ message: "Invalid ID format" }), { status: 400 });
        }

        // Prepare the update data (only include non-empty fields)
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        if (Object.keys(updateData).length === 0) {
            return new Response(JSON.stringify({ message: "No fields to update" }), { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("cloud");

        // Use ObjectId to find the user by ID
        const result = await db.collection("users").updateOne(
            { _id: objectId }, // Find user by ObjectId
            { $set: updateData } // Update the fields
        );

        console.log(result);

        if (result.modifiedCount > 0) {
            return new Response(JSON.stringify({ message: "User updated successfully" }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: "No changes made or user not found" }), { status: 400 });
        }

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
    }
}
