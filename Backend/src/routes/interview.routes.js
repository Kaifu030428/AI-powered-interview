const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const interviewController = require("../controllers/interview.controllers")
const upload = require("../middleware/file.middleware")

const interviewRouter = express.Router()

interviewRouter.post("/" , authMiddleware,upload.single("resume"),interviewController.generateInterviewReportController)


interviewRouter.get("/resume/:interviewReportId", authMiddleware, interviewController.generateResumePdfController)

interviewRouter.get("/" , authMiddleware, interviewController.getAllInterviewReportsController)

interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController)

module.exports = interviewRouter;