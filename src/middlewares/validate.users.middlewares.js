import {userSchema} from "../models/users.model.js"
export async function validateUsersSchema (req, res, next){
    const user = req.body;
    const { error } = userSchema.validate(user, { abortEarly: false })

        if (error) {
            const errors = error.details.map((detail) => detail.message)
            return res.status(400).send(errors)
        }

        next();
}