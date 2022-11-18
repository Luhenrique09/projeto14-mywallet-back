import joi from "joi";

export const recordSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
    type: joi.string().required().valid("entrada", "saida"),
})