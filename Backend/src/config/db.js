const mongoose = require("mongoose");

const connectdb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("conneted to db")

        
    } catch (error) {
        console.log("error in connecting db")
    }
}

module.exports = connectdb;