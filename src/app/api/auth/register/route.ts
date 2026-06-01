import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db";
import UserModel from "@/models/Users";

export async function POST(request: Request){
    try {
        const { username, email, password } = await request.json();
        
        // Validate

        if(!username || !email || !password){
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            
            )
        }
        await dbConnect()

        const existingUser = await UserModel.findOne({ 
            $or:[{ email }, { username }] 
        })
        if(existingUser){
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            )      
    }
    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create User
    const user = await UserModel.create({
        username,
        email, 
        password: hashedPassword
    })

    return NextResponse.json(
        {
          message: "User registered successfully",
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
          } , 
        },
        {status: 201}
    )
} catch(error){
    console.error("Register error: ", error)
    return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
    )
}

}