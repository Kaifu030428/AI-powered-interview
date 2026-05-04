const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interview.report.model");
const { get } = require("mongoose");

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
        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "Invalid file type. Only PDF is supported." });
        }
        try {
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text;
        } catch(err) {
            console.error("PDF Parse Error:", err);
            return res.status(400).json({ message: "Failed to read PDF file. It might be corrupted." });
        }
      }
  
      // ✅ AI CALL (ye missing tha isliye error aaya)
      const interviewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
      });
  
      // ✅ FORMAT DATA FOR MONGODB
      const aiData = interviewReportByAi;
  
      const formattedData = {
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
  
        title: aiData.title,
        matchScore: aiData.matchScore,
  
        technicalQuestions: (aiData.technicalQuestions || []).map((q) => {
          if (typeof q === 'string') {
            return {
              question: q,
              intention: "To test technical knowledge",
              answer: "Explain with examples and projects"
            };
          }
          return {
            question: q.question || q.Question || "No question provided",
            intention: q.intention || q.Intention || "To test technical knowledge",
            answer: q.answer || q.Answer || q.expectedAnswer || "Explain with examples and projects"
          };
        }),
  
        behavioralQuestions: (aiData.behavioralQuestions || []).map((q) => {
          if (typeof q === 'string') {
            return {
              question: q,
              intention: "To evaluate behavior",
              answer: "Use STAR method"
            };
          }
          return {
            question: q.question || q.Question || "No question provided",
            intention: q.intention || q.Intention || "To evaluate behavior",
            answer: q.answer || q.Answer || q.expectedAnswer || "Use STAR method"
          };
        }),
  
        skillGaps: (aiData.skillGaps || []).map((skill) => ({
          skill: typeof skill === 'string' ? skill : (skill.skill || "Unknown"),
          severity: (typeof skill === 'object' && skill.severity) 
                      ? (String(skill.severity).charAt(0).toUpperCase() + String(skill.severity).slice(1).toLowerCase()) 
                      : "Medium",
        })),
  
        preparationPlan: (Array.isArray(aiData.preparationPlan) 
          ? aiData.preparationPlan 
          : (typeof aiData.preparationPlan === 'string' 
              ? (()=>{ try{ const p=JSON.parse(aiData.preparationPlan); return typeof p==='object'?Object.values(p):[p] }catch{return [aiData.preparationPlan]} })() 
              : Object.values(aiData.preparationPlan||{}) )
        ).map((item, index) => ({
          day: typeof item === 'object' && item.day ? item.day : index + 1,
          focus: typeof item === 'object' && item.focus ? item.focus : String(item),
          tasks: typeof item === 'object' && Array.isArray(item.tasks) ? item.tasks : [String(item)],
        })),
      };
  
      // ✅ SAVE TO DB
      const interviewReport = await interviewReportModel.create(formattedData);
  
      res.status(200).json(interviewReport);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  };

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
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
 
async function getInterviewReportByIdController(req, res) {

    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

module.exports = {
  generateInterviewReportController,
  getAllInterviewReportsController,
  generateResumePdfController,
  getInterviewReportByIdController
};
