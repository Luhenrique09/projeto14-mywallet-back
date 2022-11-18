import {
    postSingUp,
    postSingIn,
    deleteSessions
} from "../controllers/users.controller.js";
import {Router} from "express"
import {validateToken} from "../middlewares/validate.token.middleware.js"
import { validateUsersSchema } from "../middlewares/validate.users.middlewares.js";

const router = Router();

router.post("/sing-up", validateUsersSchema, postSingUp);

router.post("/sing-in", postSingIn);

router.use(validateToken)

router.delete("/sessions", deleteSessions);

export default router;