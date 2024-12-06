<<<<<<< HEAD
=======



>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
import { MongoClient } from "mongodb";

const client = new MongoClient('mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/');

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
