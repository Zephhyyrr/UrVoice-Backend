import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";
import { upload } from "../middleware/upload";
import { RequestHandler, Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: { userId: number };
        }
    }
}
import { authenticateToken } from "../middleware/auth";

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as string;

const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || "1h";
const JWT_REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION || "7d";

const parsedJwtExpiration: SignOptions['expiresIn'] = /^\d+$/.test(JWT_EXPIRATION) ? Number(JWT_EXPIRATION) : JWT_EXPIRATION as SignOptions['expiresIn'];
const parsedJwtRefreshExpiration: SignOptions['expiresIn'] = /^\d+$/.test(JWT_REFRESH_EXPIRATION) ? Number(JWT_REFRESH_EXPIRATION) : JWT_REFRESH_EXPIRATION as SignOptions['expiresIn'];

const generateToken = (userId: number): string => {
    const options: SignOptions = { expiresIn: parsedJwtExpiration };
    return jwt.sign({ userId }, JWT_SECRET, options);
};

const generateRefreshToken = (userId: number): string => {
    const options: SignOptions = { expiresIn: parsedJwtRefreshExpiration };
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, options);
};

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUser = async (name: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    const accessToken = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({ data: { token: hashedRefreshToken, userId: newUser.id } });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        accessToken,
        refreshToken
    };
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const existingToken = await prisma.refreshToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });

    let refreshToken = existingToken?.token;

    if (!existingToken || (new Date().getTime() - new Date(existingToken.createdAt).getTime()) > 3600000) {
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
        refreshToken = generateRefreshToken(user.id); 

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await prisma.refreshToken.create({
            data: { token: hashedRefreshToken, userId: user.id },
        });
    }

    const accessToken = generateToken(user.id);

    return { accessToken, refreshToken };
};

export const getAllUsers: RequestHandler[] = [
    authenticateToken,
    async (req, res, next) => {
        try {
            const users = await prisma.user.findMany();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }
];

export const fetchUserById: RequestHandler[] = [
    authenticateToken,
    async (req, res, next) => {
        try {
            const userId = Number(req.query.id);
            if (isNaN(userId)) {
                return res.status(400).json({ error: "Invalid user ID" });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
];

export const updateProfilePhoto: RequestHandler[] = [
    authenticateToken,
    upload.single("profileImage"),
    async (req, res, next) => {
        try {
            const userId = (req.user as { userId: number }).userId;
            const imagePath = req.file?.path;

            if (!imagePath) {
                return res.status(400).json({ error: "Image file is required" });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { profileImage: imagePath },
            });

            res.status(200).json({
                status: true,
                message: "Profile image updated successfully",
                profileImage: updatedUser.profileImage,
            });
        } catch (error) {
            next(error);
        }
    },
];

