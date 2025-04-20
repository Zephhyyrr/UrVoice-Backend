import { RequestHandler } from "express";
import * as userService from "../services/userService";
import * as fs from "fs";

export const register: RequestHandler = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await userService.registerUser(name, email, password);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
            },
        });
    } catch (e) {
        next(e);
    }
};

export const login: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await userService.loginUser(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (e) {
        next(e);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req.user as { userId: number }).userId;
        const { name, email } = req.body;

        const updatedUser = await userService.updateUser(userId, name, email);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (e) {
        next(e);
    }
};

export const updateProfilePhoto: RequestHandler = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
        }
        
        const userId = req.user.userId;
        const file = req.file;
        
        if (!file) {
            res.status(400).json({ error: "Image file is required" });
            return;
        }
        
        const updatedUser = await userService.updateProfilePhoto(userId, file);
        
        res.status(200).json({
            status: true,
            message: "Profile image updated successfully",
            profileImage: updatedUser.profileImage,
            user: updatedUser
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req.user as { userId: number }).userId;
        await userService.deleteUser(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (e) {
        next(e);
    }
};

export const logout: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req.user as { userId: number }).userId;
        await userService.logout(userId);

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (e) {
        next(e);
    }
};
