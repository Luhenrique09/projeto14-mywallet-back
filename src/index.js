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
const userCollection = db.collection("users");

app.post("/sign-up", async (req, res) => {
    const user = req.body;
  
    try {
       const userExists = await userCollection.findOne({ email: user.email });
      if (userExists) {
        return res.status(409).send({ message: "Esse email já existe" });
      } 
  
       const { error } = userSchema.validate(user, { abortEarly: false });
  
      if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).send(errors);
      }
  
      const hashPassword = bcrypt.hashSync(user.password, 10); 
  
      await userCollection.insertOne({ ...user, password: hashPassword });
      res.sendStatus(201);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;
  
    const token = uuidV4();
  
    try {
      const userExists = await userCollection.findOne({ email });
  
      if (!userExists) {
        return res.sendStatus(401);
      }
  
      const passwordOk = bcrypt.compareSync(password, userExists.password);
  
      if (!passwordOk) {
        return res.sendStatus(401);
      }
  
      // Verificar se o user já possui uma sessão aberta:
      /* const userSession = await db
        .collection("sessions")
        .findOne({ userId: userExists._id });
  
      if (userSession) {
        return res
          .status(401)
          .send({ message: "Você já está logado!"});
      } */
  
      // Se não tiver sessão aberta, abra uma nova.
      await db.collection("sessions").insertOne({
        token,
        userId: userExists._id,
      });
      
      res.send(token);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

  app.post("/records", async (req, res) => {
    const { authorization } = req.headers; 
    const {value, description, type} = req.body;
  
    const date = new Date()
    const dateFormt = `${date.getDate()}/${date.getMonth()+1}` 
  
  
    const token = authorization?.replace("Bearer ", "");
  
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        
      const session = await db.collection("sessions").findOne({ token });
  
      const user = await userCollection.findOne({ _id: session.userId });
      if (!user) {
          return res.sendStatus(401);
      }
      delete user.password;

      const record = await db.collection("records").insertOne({ 
        _id: session.userId,
        value,
        description,
        date: dateFormt,
        type
      })
  
      res.send(record).status(201);
  } catch (err) {
      console.log(err);
      res.sendStatus(500);
  }

  })

  app.get("/records", async (req, res) => { 
    const { authorization } = req.headers; // Bearer Token
  
    const token = authorization?.replace("Bearer ", "");
  
    if (!token) {
        return res.sendStatus(401);
    }
  
    try {
        
        const session = await db.collection("sessions").findOne({ token });
    
        const user = await userCollection.findOne({ _id: session?.userId });
        if (!user) {
            return res.sendStatus(401);
        }
        delete user.password;

        const record = await db.collection("records").find(session.userId).toArray()
    
        res.send( {record, user });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
  });


app.listen(5000, () => console.log("Server running in port: 5000"))