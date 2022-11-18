import {db} from "../database/db.js"
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";

async function postSingUp(req, res) {
    const user = req.body;

    const hashPassword = bcrypt.hashSync(user.password, 10)

    try {
        const userExists = await db.collection("users").findOne({ email: user.email })
        if (userExists) {
            return res.status(409).send({ message: "Esse email já existe" })
        }
    
        await db.collection("users").insertOne({ ...user, password: hashPassword })
        return res.sendStatus(201)

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }
}

async function postSingIn(req, res) {
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
}

async function deleteSessions(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    try {
        const session = await db.collection("sessions").findOne({ token })
        const user = await db.collection("users").findOne({ _id: session?.userId })

        if (!user) {
            return res.sendStatus(401)
        }
        await db.collection("sessions").deleteOne({ token })
        res.sendStatus(201)

    } catch (err) {
        console.log(err)
        res.status(401).send(err)
    }
}

export {
    postSingUp,
    postSingIn,
    deleteSessions
}