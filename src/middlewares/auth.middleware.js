import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // take the accessToken from cookies in web app or from header in mobile app  (as no cookies in mobile app)
        // in header the accesToken are in the form of Authorization: Bearer eyJhbGci...

        if (!token) {
            throw new ApiErrors(401, "Unauthorised Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // here the .verify() basically decodes the encoded token and by verifieng it with the ACCESS_TOKEN_SECRET
        // while making the accesToken we have assigned them with ACCESS_TOKEN_SECRET which is verified here 
        // as the token contains the ACCESS_TOKEN_SECRET

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        // extract the user from db and remove passwor and refreshtoken field 

        if (!user) {
            throw new ApiErrors(401, "Invalid Access Token")
        }

        req.user = user
        // 👉 Adds user info to request
        // 👉 So next controller can use it
        // Example usage later:
        // req.user._id
        // req.user.email

        next()
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid access token")
    }

})