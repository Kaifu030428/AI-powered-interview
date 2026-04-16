const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const registerUserController = async(req, res) => {
    try {
        const {username , email , password} = req.body

        if(!username || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        const existingUser = await userModel.findOne({$or :[{email}, {username}]})

        if(existingUser) {
            return res.status(409).json({message: "User already exists"})
            }

        const hashedPassword = await bcrypt.hash(password, 10)   

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword
        })

        const token  = jwt.sign({id: newUser._id , user:username}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.cookie("token", token ,{
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })

        return res.status(201).json({message: "User registered successfully", user: {id: newUser._id, username:newUser.username , email:newUser.email}, token})
    } catch (error) {
        console.log("REGISTER ERROR:", error);
        return res.status(500).json({message: "Internal server error"})
    }

}

const loginController  = async (req,res)=>{
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token  = jwt.sign(
            {id: user._id , user:user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}


const logoutController = async (req, res) => {
    try {
    const token = req.cookies.token;
    if(token){
        await tokenBlacklistModel.create({token})
        res.clearCookie("token")
        return res.status(200).json({ message: "User logged out successfully" });
    }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getMeController = async (req, res) => {
    try {
         const user  = await userModel.findById(req.user.id)

         if (!user) {
             return res.status(404).json({ message: "User not found" })
         }

         res.status(200).json({
            message: "User details fetched successfully",
            user: {id: user._id, 
                username: user.username, 
                email: user.email}})


    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {registerUserController , loginController, logoutController, getMeController}