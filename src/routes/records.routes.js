import { postRecords, getRecords } from "../controllers/records.controller.js";
import {Router} from "express"
import {validateToken} from "../middlewares/validate.token.middleware.js"
import { validateRecordSchema } from "../middlewares/validate.recordsSchema.middlewares.js";

const router = Router();

router.use(validateToken);

router.post("/records", validateRecordSchema, postRecords);

router.get("/records", getRecords);

export default router;