import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

// middlewares:
app.use(cors({  // .use : used to define the middleware 
    origin : process.env.CORS_ORIGIN, // This tells which frontend is allowed to access your backend.
    credentials: true   // This allows cookies, authorization headers, and sessions to be sent.
}))
app.use(express.json({limit:"16kb"}))  // rate limiting for request of json 
app.use(express.urlencoded({extended:true , limit : "16kb"}))  //extracting data from url 
app.use(express.static("public"))  // for storing some files on the server publically
app.use(cookieParser())    // for performing CRUD operation of cookie 

// import routers : 
import UserRouter from "./routes/user.route.js"
// route declaration 
app.use("/api/v1/users",UserRouter)
// localhost:3000/api/v1/users/register


export {app} 