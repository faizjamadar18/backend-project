// routes are imported in app.js after the middlewares in app.js 

import { Router } from "express";
import { LoginUser, LogoutUser, refreshAccessToken, UserRegister } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
    UserRegister
)
// Frontend must send file as:
// <input type="file" name="avatar" /> 
// <input type="file" name="coverImage" />


router.route("/login").post(LoginUser)


// secure routed 
router.route("/logout").post(verifyJWT, LogoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router