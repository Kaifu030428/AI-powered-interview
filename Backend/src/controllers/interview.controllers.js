const pdfParse = require("pdf-parse")
const { generateInterviewReport } = require("../services/ai.service")
const interviewReportModel = require("../models/interview.report.model")


const generateInterviewReportController = async (req,res) => {

    try {
      
        const resumeContent = await(new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const{selfDescription, jobDescription} = req.body;
        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });

const interviewReport = await interviewReportModel.create({
    user:req.user.id,
    resume: resumeContent,
    selfDescription,
    jobDescription,
    ...interviewReportByAi

})
        res.status(200).json(interviewReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = { generateInterviewReportController }