require("dotenv").config();
const mongoose = require("mongoose");
const { generateInterviewReportController } = require("./src/controllers/interview.controllers");

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const req = {
       body: {
          jobDescription: "Senior Node Developer",
          selfDescription: "I love coding"
       },
       user: {
          Id: new mongoose.Types.ObjectId() // valid objectId
       }
    };
    const res = {
       status: (code) => {
           console.log("Status:", code);
           return { json: (data) => {
               if (data.error) console.error("CTRL ERROR:", data.error);
               else console.log("Success! Data returned");
           } };
       }
    };
    await generateInterviewReportController(req, res);
    await mongoose.disconnect();
}
test();
