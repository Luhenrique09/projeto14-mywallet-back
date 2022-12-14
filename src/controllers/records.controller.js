import {db} from "../database/db.js"

async function postRecords(req, res) {
    const { authorization } = req.headers
    const { value, description, type } = req.body
    const data = new Date()
    const dataFormated = `${data.getDate()}/${data.getMonth() + 1}`
    const token = authorization?.replace("Bearer ", "")

   
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


}

async function getRecords(req, res) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

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

}

export {
    postRecords,
    getRecords
}