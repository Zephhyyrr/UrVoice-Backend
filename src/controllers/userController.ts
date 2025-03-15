import { RequestHandler } from "express";
import { registerSchema, registerUser,} from "../services/userService";

export const register: RequestHandler = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const data = await registerUser(name, email, password);

        res.status(201).json({
            message: "User registered successfully",
            data: data 
        });
    } catch (error) {
        next(error);
    }
};

export const login: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        next(error);
    }
};

export const getUsers: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        res.status(200).json({ message: "User data retrieved successfully" });
    } catch (error) {
        next(error);
    }
};
