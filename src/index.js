import express from "express";
import cors from "cors";
import joi from "joi";
import usersRouters from "./routes/users.routes.js"
import recordsRouters from "./routes/records.routes.js"

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

app.use(cors());
app.use(express.json());
app.use(usersRouters);
app.use(recordsRouters);

app.listen(5000, () => console.log("Server running in port: 5000"))