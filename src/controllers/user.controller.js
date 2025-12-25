import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/apiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

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
    const { username, email, fullName, password } = req.body


    // 2> validation - not empty
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiErrors(400, "All field are required")     //constructor cannot be invoked without 'new'
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


    // console.log(req.files);
    // [Object: null prototype] {
    //   avatar: [
    //     {
    //       fieldname: 'avatar',
    //       originalname: 'Screenshot 2025-12-07 112104.png',
    //       encoding: '7bit',
    //       mimetype: 'image/png',
    //       destination: './public/temp',
    //       filename: 'Screenshot 2025-12-07 112104.png',
    //       path: 'public\\temp\\Screenshot 2025-12-07 112104.png',
    //       size: 487
    //     }
    //   ],
    //   coverImage: [
    //     {
    //       fieldname: 'coverImage',
    //       originalname: 'Screenshot 2025-12-07 131223.png',
    //       encoding: '7bit',
    //       mimetype: 'image/png',
    //       destination: './public/temp',
    //       filename: 'Screenshot 2025-12-07 131223.png',
    //       path: 'public\\temp\\Screenshot 2025-12-07 131223.png',
    //       size: 22131
    //     }
    //   ]
    // }




    // 4> check for images, check for avatar:
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // agr req.files agar hai aur phir usme coverImage wala array agr array hai aur phir agr coverImage wala array ki lenght > 0 hai


    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar Field is required")    //constructor cannot be invoked without 'new'
    }


    // 5> upload them to cloudinary, avatar and coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiErrors(400, "Avatar Field is required")
    }


    // 6> create user object - create entry in db
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })


    // 7> remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    // 8> check for user creation
    if (!createdUser) {
        throw new ApiErrors(500, "Something went wrong in the server")
    }

    // 9> return res
    return res.status(200).json(
        new ApiResponse(201, createdUser, "User Registered Successfully")
    )

})

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefereshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        console.log(error);
        throw new ApiErrors(500, "Something went wrong while generating referesh and access token")
    }
}

const LoginUser = asyncHandler(async (req, res) => {

    // 1> req.body ---> data
    // 2> validate if empty 
    // 3> find in the DB 
    // 4> if find validate password 
    // 5> if validate generate access token and refresh token ,add refresh token in the that particular user 
    // 6> generate cookie 


    // 1> req.body ---> data
    const { username, email, password } = req.body


    // 2> validate if empty 
    if (!(username || email)) {
        throw new ApiErrors(400, "Email or username is required")
    }

    // 3> find in the DB 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiErrors(401, "You need to register first")
    }

    // 4> if find validate password
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiErrors(402, "Invalid Credentials")
    }


    // 5> if validate generate access token and refresh token ,add refresh token in the that particular user 
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // return user without password and refreshToken 

    const options = {
        httpOnly: true,   // Frontend / browser JavaScript cannot read it by "document.cookie"
        secure: true       // Cookie is sent ONLY over HTTPS not http , Encrypted communication
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})


const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "Logout SuccessFully")
        )

})


// IMP: read the notes in the notebook to understand it in better 
const refreshAccessToken = asyncHandler(async (req, res) => {    // this will be called when the access token get expired 
    // 1> get the refreh token from the browser (i.e coookies)
    // 2> decode the refresh token , u will get the _id of the user as while generating refrresh token we have send the _id as the Payload data 
    // 3> after getting the id find the user with that id 
    // 4> verify it to generate new token ,now in datbase the refresh token is stored in encoded form , so  dont compare it with the decoded refresh token compare it with cookies refrresh token 
    // 5> call generateAccessAndRefereshTokens to get new tokens 
    // 6> then send them in the response 

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiErrors(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiErrors(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiErrors(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        // generatig new refresh token 
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid refresh token")
    }


})

export {
    UserRegister,
    LoginUser,
    LogoutUser,
    refreshAccessToken
}