const {Router} = require("express");
const { registerUserController, loginController, logoutController, getMeController } = require("../controllers/auth.controllers");
const authMiddleware = require("../middleware/auth.middleware")

const authRouter  = Router()


authRouter.post("/register",registerUserController)
authRouter.post("/login" , loginController)
authRouter.get("/logout",logoutController)
authRouter.get("/get-me",authMiddleware,getMeController )


module.exports = authRouter;