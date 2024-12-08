import clientPromise from "@/lib/mongodb";

export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // to specify revalidation interval


export async function POST(req) {
  try {
    const { email, password, name , role } = await req.json();

    // Basic validation
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ message: "Email, name, and password are required" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cloud");

    console.log("Connected to MongoDB successfully.");

    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Email already in use" }),
        { status: 400 }
      );
    }

    // Create a new user
    const newUser = {
      email,
      password,
      name,
      role,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    console.log("New user created successfully:", result);

    return new Response(
      JSON.stringify({ message: "Signup successful, please log in" }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/auth/signup:", error);
    return new Response(
      JSON.stringify({ message: "Error creating account", error: error.message }),
      { status: 500 }
    );
  }
}





export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("cloud");

    console.log("Connected to MongoDB successfully.");

    // Fetch all users from the "users" collection
    const users = await db.collection("users").find().toArray();

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users found" }),
        { status: 404 }
      );
    }

    // Return the list of users
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error in fetching all users:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching users", error: error.message }),
      { status: 500 }
    );
  }
}
