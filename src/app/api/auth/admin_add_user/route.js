import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, password, name, role } = await req.json();

    // Basic validation
    if (!email || !password || !name ||!role) {
      return new Response(
        JSON.stringify({ message: "Email, name,role, and password are required" }),
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
      JSON.stringify({ message: "Create user SuccessFully " }),
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