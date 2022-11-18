import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";
import {
    postSingUp,
    postSingIn,
    deleteSessions
} from "./controllers/users.controller.js";
import { postRecords, getRecords } from "./controllers/records.controller.js";

export const userSchema = joi.object({
    name: joi.string().required().min(3).max(50),
    password: joi.string().required(),
    email: joi.string().email().required(),
});

export const recordSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().required().valid("entrada", "saida"),
})

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    mongoClient.connect()
} catch (err) {
    console.log(err)
}

export const db = mongoClient.db("Mywallet");

app.post("/sing-up", postSingUp);

app.post("/sing-in", postSingIn);

app.post("/records", postRecords);

app.get("/records", getRecords);

app.delete("/sessions", deleteSessions);


app.listen(5000, () => console.log("Server running in port: 5000"))