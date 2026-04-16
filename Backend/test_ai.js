require("dotenv").config()
const { generateInterviewReport } = require("./src/services/ai.service")

async function test() {
    try {
        const res = await generateInterviewReport({
            resume: "Backend Developer Node.js React",
            selfDescription: "I love coding",
            jobDescription: "Senior Node Developer"
        })
        console.log("Success:", !!res)
    } catch(err) {
        console.error("AI Error:", err.message)
    }
}
test()
