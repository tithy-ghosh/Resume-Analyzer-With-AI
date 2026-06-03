import mongoose, { Schema } from "mongoose";

const technicalQuestionSchema = new Schema({
    question: String,
    intention: String,
    answer: String,
}, { _id: false })

const behavioralQuestionSchema = new Schema({
    question: String,
    intention: String,
    answer: String,
}, { _id: false })

const skillGapSchema = new Schema({
    skill: String,
    severity: { type: String, enum: ["low", "medium", "high"] }
}, { _id: false })

const preparationPlanSchema = new Schema({
    day: Number,
    focus: String,
    tasks: [String]
}, { _id: false })

const interviewReportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    jobDescription: String,
    selfDescription: String,
    resume: String,
    matchScore: { type: Number, min: 0, max: 100 },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
}, { timestamps: true })

const InterviewReportModel = mongoose.models.InterviewReport || mongoose.model("InterviewReport", interviewReportSchema)

export default InterviewReportModel