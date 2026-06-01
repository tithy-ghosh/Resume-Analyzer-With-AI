import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoogedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

    // If not logged in and trying to access protected page -> redirect

    if(!isLoogedIn && !isAuthPage){
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // If logged in and trying to access login/access login/register -> redirect to dashboard

    if(isLoogedIn && isAuthPage){
        return NextResponse.redirect(new URL("/dashboard", req.url))
    
    }
    return NextResponse.next()
})

export const config = {
    matcher: ["/", "/dashboard/:path*", "/analyze/:path*", "/login", "/register"],
}