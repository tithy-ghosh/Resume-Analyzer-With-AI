import mongoose from "mongoose";
import { logger } from "./logger"

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
       connection.isConnected = db.connections[0].readyState
       logger.info("Database connected")
    } catch (error) {
       logger.error("Database connection failed", error)
       
       throw new Error("Failed to connect database")
    }
}
export default dbConnect
