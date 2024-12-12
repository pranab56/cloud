import clientPromise from "@/lib/mongodb";

export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // revalidation interval

// Helper function to handle DB connection
const getDbClient = async () => {
  const client = await clientPromise;
  return client.db("cloud");
};

// Helper function for basic validation
const validateUserData = (email, password, name) => {
  if (!email || !password || !name) {
    return { isValid: false, message: "Email, name, and password are required" };
  }
  return { isValid: true };
};

// POST method to handle user signup
export async function POST(req) {
  try {
    const { email, password, name, role } = await req.json();

    // Validate user input
    const { isValid, message } = validateUserData(email, password, name);
    if (!isValid) {
      return new Response(JSON.stringify({ message }), { status: 400 });
    }

    const db = await getDbClient();

    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "Email already in use" }),
        { status: 400 }
      );
    }

    // Create a new user
    const newUser = { email, password, name, role, createdAt: new Date() };
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

// GET method to fetch all users
export async function GET() {
  try {
    const db = await getDbClient();

    // Fetch all users from the "users" collection
    const users = await db.collection("users").find().sort({ _id: -1 }).toArray();

    if (!users.length) {
      return new Response(JSON.stringify({ message: "No users found" }), { status: 404 });
    }

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ message: "Error fetching users", error: error.message }),
      { status: 500 }
    );
  }
}
