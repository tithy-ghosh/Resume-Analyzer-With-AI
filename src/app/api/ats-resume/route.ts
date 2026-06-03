import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import dbConnect from "@/lib/db";
import InterviewReportModel from "@/models/InterviewReport";
import { title } from "process";


export async function POST(request: Request){
    try {
        const session = await auth()
        if(!session){
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 401 })
        }
        const { reportId } = await request.json()

        if(!reportId){
            return NextResponse.json({
                message: "Report ID is required"
            }, { status: 400 })
        }
        await dbConnect()
        const report = await InterviewReportModel.findOne({
            _id: reportId,
            user: session.user.id
        })
        if(!report){
            return NextResponse.json({
                message: "Report not found"
            }, { status: 404 })
        }

        const atsResume = await generateATSResume({
            resume: report.resume ?? "",
            jobDescriptiom: report.jobDescription ?? "",
            title: report.title ?? "",
        })

        return NextResponse.json({
            atsResume
        }, {status: 200})
    } catch (error) {
        console.error("ATS error:  ", error)
        return NextResponse.json({
            message: "Failed to generate ATS friendly resume"
        }, {status: 500})
    }
}