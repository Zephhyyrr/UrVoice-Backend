import { RequestHandler } from "express";
import { registerSchema, registerUser, loginUser} from "../services/userService";
import jwt from "jsonwebtoken";

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

export const login: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Refresh Token is required" });
            return;
        }

        const refreshToken = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
            console.log("Decoded Refresh Token:", decoded);
        } catch (error) {
            res.status(403).json({ error: "Invalid or expired Refresh Token" });
            return;
        }

        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const { accessToken } = await loginUser(email, password);

        res.status(200).json({
            message: "Login successful",
            accessToken
        });
        return;
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

export const getUserById: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        res.status(200).json({ message: "User data retrieved successfully" });
    } catch (error) {
        next(error);
    }
}
