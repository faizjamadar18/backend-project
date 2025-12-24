import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/apiErrors.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponseError} from "../utils/apiResponseError.js"

const UserRegister = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: by username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // 1>  get user details from frontend
    const { username, email, fullName, password } = req.body()


    // 2> validation - not empty
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiErrors(400, "All field are required")
    }
    // 👉.some() means:
    // “Is there AT LEAST ONE element that matches this condition?”
    // If yes → returns true (i.e error)
    // If no → returns false (else do nothing)


    // 3> check if user already exists: by username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // 👉 $or means:
    // Match at least ONE condition
    // This is MongoDB syntax
    if (existedUser) {
        throw new ApiErrors(409, "Username or Email already exist")
    }


    // 4> check for images, check for avatar:
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiErrors(400,"Avatar Field is required")
    }


    // 5> upload them to cloudinary, avatar and coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiErrors(400,"Avatar Field is required")
    }


    // 6> create user object - create entry in db
    const user = User.create({
        username : username.toLowerCase(),
        email,
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        password
    })


    // 7> remove password and refresh token field from response
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )


    // 8> check for user creation
    if(!createdUser){
        throw new ApiErrors(500,"Something went wrong in the server")
    }

    // 9> return res
    return res.status(200).json(
        new ApiResponseError(201,createdUser,"User Registered Successfully")
    )

})

export { UserRegister }