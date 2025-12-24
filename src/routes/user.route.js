// routes are imported in app.js after the middlewares in app.js 

import { Router } from "express";
import { UserRegister } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
// Frontend must send file as:
// <input type="file" name="avatar" /> 
// <input type="file" name="coverImage" />



export default router