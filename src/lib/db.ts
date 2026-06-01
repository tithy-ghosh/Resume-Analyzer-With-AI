import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
 
    if(connection.isConnected){
        return
    }
    if(!process.env.MONGODB_URI){
        throw new Error("Please define MONGODB_URI in .env")
    }

    try {
       const db = await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
       console.error("Database connection failed", error)
       
       throw new Error("Failed to connect database")
    }
}
export default dbConnect