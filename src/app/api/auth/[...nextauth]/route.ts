import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/db"
import UserModel from "@/models/Users"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
          name: "credentials",
          credentials:{
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password"},
          }, 
          
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
              throw new Error("Email and password are required")
            }

            await dbConnect()

            const user = await UserModel.findOne({ email: credentials.email });
            if (!user) {
              throw new Error("No user found with this email");
            }

            const isValidPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (!isValidPassword) {
              throw new Error ("Invalid Password")
            }

            return {
              id: user._id.toString(),
              email: user.email,
              username: user.username,
            };
          },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }){
            if(user){
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session ({ session, token }){
            if(token){
                session.user.id = token.id as string;
                session.user.username = token.username as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST}