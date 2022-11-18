import {userSchema} from "../models/users.model.js"
import { db } from "../database/db.js";
export async function validateUsersSchema (req, res, next){
    const user = req.body;
    const { error } = userSchema.validate(user, { abortEarly: false })

        if (error) {
            const errors = error.details.map((detail) => detail.message)
            return res.status(400).send(errors)
        }
        try {
            const userExists = await db.collection("users").findOne({ email: user.email })
            if (userExists) {
                return res.status(409).send({ message: "Esse email já existe" })
            }
        } catch (err) {
            return res.sendStatus(500)
        }
        next();
}