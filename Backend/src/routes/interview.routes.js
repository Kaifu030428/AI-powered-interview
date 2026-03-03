const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const interviewController = require("../controllers/interview.controllers")
const upload = require("../middleware/file.middleware")

const interviewRouter = express.Router()

interviewRouter.post("/" , authMiddleware,upload.single("resume"),interviewController.generateInterviewReportController)



module.exports = interviewRouter;