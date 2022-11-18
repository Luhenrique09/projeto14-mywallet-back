import { postRecords, getRecords } from "../controllers/records.controller.js";
import {Router} from "express"

const router = Router();

router.post("/records", postRecords);

router.get("/records", getRecords);

export default router;