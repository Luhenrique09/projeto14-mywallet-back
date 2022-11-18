import {recordSchema} from "../models/records.model.js"

export function validateRecordSchema (req, res, next){
    
    const { error } = recordSchema.validate(req.body, { abortEarly: false })

        if (error) {
            const errors = error.details.map((detail) => detail.message)
            return res.status(400).send(errors)
        }
        next();
}