import { MongoClient } from "mongodb";
import dotenv from "dotenv"

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    mongoClient.connect()
} catch (err) {
    console.log(err)
}

export const db = mongoClient.db("Mywallet");