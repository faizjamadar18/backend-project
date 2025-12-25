import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

// before saving something to this schema then call a function it act as a middleware 
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;  // if password is not modified i.e there is the change in other fields like name,etc

    this.password = await bcrypt.hash(this.password, 10) // 10 is the strength of the lock 🔒 bcrypt repeats the hashing process 10 times
     // moddleware says : I’m done, you can continue now.
})


userSchema.methods.isPasswordCorrect = async function(password) {  // .method : creating our own function to the Mongoose schema
    return await bcrypt.compare(password, this.password)
}
// usecase in code : user.isPasswordCorrect("mypassword")

userSchema.methods.generateAccessToken = function(){  
    return jwt.sign(       // .sign : “Create a secure token for this user.”
        {
            _id: this._id,           // data inside the token 
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefereshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Access Token → lets you use the app , exprires early 
// Refresh Token → keeps you logged in ,when access token expires than alocate them a new access tokan 
export const User = mongoose.model("User", userSchema)