import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";

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
    return prisma.user.create({ data: { name, email, password: hashedPassword } });
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid email or password");
    }
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
    return { accessToken, refreshToken };
};

export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany(); // Ambil semua user
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getUserById: RequestHandler = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10); 
        if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid user ID" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
