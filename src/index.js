import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";

const userSchema = joi.object({
    name: joi.string().required().min(3).max(50),
    password: joi.string().required(),
    email: joi.string().email().required(),
});

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

const db = mongoClient.db("Mywallet");

app.post("/sing-up", async (req, res) => {
    const user = req.body

    const hashPassword = bcrypt.hashSync(user.password, 10)

    try {
        const userExists = await db.collection("users").findOne({ email: user.email })
        if (userExists) {
            return res.status(409).send({ message: "Esse email já existe" })
        }

        const { error } = userSchema.validate(user, { abortEarly: false })

        if (error) {
            const errors = error.details.map((detail) => detail.message)
            return res.status(400).send(errors)
        }

        await db.collection("users").insertOne({ ...user, password: hashPassword })
        return res.sendStatus(201)

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
})

app.post("/sing-in", async (req, res) => {
    const { email, password } = req.body
    let token = uuidV4()

    try {
        const userExists = await db.collection("users").findOne({ email })
        if (!userExists) {
            return send.status(401)
        }

        const rightPassword = bcrypt.compareSync(password, userExists.password)

        if (!rightPassword) {
            return send.status(401)
        }

        await db.collection("sessions").insertOne({
            token,
            userId: userExists._id
        })

        res.send(token)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post("/records", async (req, res) => {
    const { authorization } = req.headers
    const { value, description, type } = req.body
    const data = new Date()
    const dataFormated = `${data.getDate()}/${data.getMonth() + 1}`
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
        return res.sendStatus(401)
    }
    try {
        const session = await db.collection("sessions").findOne({ token })
        const user = await db.collection("users").findOne({ _id: session?.userId })

        if (!user) {
            return res.sendStatus(401)
        }

        await db.collection("records").insertOne({
            id: session.userId,
            date: dataFormated,
            value,
            description,
            type
        })


        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.status(401).send(err)
    }


})

app.get("/records", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
        return res.sendStatus(401)
    }

    try {
        const session = await db.collection("sessions").findOne({ token })
        const user = await db.collection("users").findOne({ _id: session?.userId })

        if (!user) {
            return res.sendStatus(401)
        }
        const record = await db.collection("records").find({ id: session.userId }).toArray()

        delete user.password

        res.send({ record, user })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }

})

app.delete("/sessions", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
        return res.sendStatus(401)
    }
    try {
        const session = await db.collection("sessions").findOne({ token })
        const user = await db.collection("users").findOne({ _id: session?.userId })

        if (!user) {
            return res.sendStatus(401)
        }
        await db.collection("sessions").deleteOne({token})
        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.status(401).send(err)
    }
})


app.listen(5000, () => console.log("Server running in port: 5000"))