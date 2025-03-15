import { Router } from "express";
import { login } from "../controllers/userController";
import { registerUser } from "../services/userService";
import { getUsers, getUserById } from "../services/userService";

const router = Router();

router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await registerUser(name, email, password);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        next(error); 
    }
});

router.post("/login", login);

router.get("/getUsers", getUsers);

router.get("/getUsers/:id", getUserById);

export default router;
