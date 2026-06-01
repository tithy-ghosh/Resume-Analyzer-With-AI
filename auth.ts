import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db";
import UserModel from "@/models/Users";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "email"},
                password: { label: "password", type: "password" },
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error("Invalid Credentials")
                    return null;
                }
                await dbConnect();
                const  user = await UserModel.findOne({
                    email: credentials.email
                
                })
                if(!user){
                    throw new Error("No user found with this email address")
                }
                const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)
                if(!isPasswordValid){
                    throw new Error("Invalid password")
                
                }
                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks:{
        async jwt({ token, user }){
            if(user){
                token.id = user.id
                token.username = user.username
            }
            return token
        },
        async session({ session, token }){
            if(token){
                session.user.id = token.id as string
                session.user.username = token.username as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})