const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interview.report.model");

const generateInterviewReportController = async (req, res) => {
    try {
      const { selfDescription, jobDescription } = req.body;
  
      if (!jobDescription) {
        return res.status(400).json({
          message: "Job description is required",
        });
      }
  
      if (!req.file && !selfDescription) {
        return res.status(400).json({
          message: "Either resume or self description is required",
        });
      }
  
      let resumeText = "";
  
      if (req.file) {
        const resumeContent = await new pdfParse.PDFParse(
          Uint8Array.from(req.file.buffer)
        ).getText();
  
        resumeText = resumeContent.text;
      }
  
      const interviewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
      });
  
      const interviewReport = await interviewReportModel.create({
        user: req.user.Id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interviewReportByAi,
      });
  
      res.status(200).json(interviewReport);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  };

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.Id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}
async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  const interviewReport = await interviewReportModel.findById(
    interviewReportId
  );

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
}

module.exports = {
  generateInterviewReportController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
