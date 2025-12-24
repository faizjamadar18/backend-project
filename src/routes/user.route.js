// routes are imported in app.js after the middlewares in app.js 

import { Router } from "express";
import { UserRegister } from "../controllers/user.controller.js";

const router = Router()


router.route("/register").post(UserRegister)



export default router