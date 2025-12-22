import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected , to Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log('MongoDB connection Failed',error)
        process.exit(1)
    }
}

export default connectDB


//  process.exit(1): 

// MongoDB connection fails ❌
// App should NOT keep running
// Server is useless without DB
// So Node app is stopped immediately
// ✔ This prevents hidden bugs later.