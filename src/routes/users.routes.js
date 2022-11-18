import {
    postSingUp,
    postSingIn,
    deleteSessions
} from "../controllers/users.controller.js";
import {Router} from "express"

const router = Router();

router.post("/sing-up", postSingUp);

router.post("/sing-in", postSingIn);

router.delete("/sessions", deleteSessions);

export default router;