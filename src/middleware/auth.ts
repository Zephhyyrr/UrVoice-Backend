import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const prisma = new PrismaClient();

if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET must be defined in environment variables");
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access denied, token missing or malformed!" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
        
        const refreshToken = await prisma.refreshToken.findFirst({
            where: {
                token: token,
                userId: decoded.userId
            }
        });

        if (!refreshToken) {
            res.status(403).json({ error: "Invalid Token!" });
            return;
        }

        const tokenCreationTime = new Date(refreshToken.createdAt).getTime();
        const currentTime = new Date().getTime();
        const oneHourInMillis = 60 * 60 * 1000; // 1 jam dalam milidetik
        
        if (currentTime - tokenCreationTime > oneHourInMillis) {
            await prisma.refreshToken.delete({
                where: {
                    id: refreshToken.id
                }
            });
            res.status(403).json({ error: "Token is Expired" });
            return;
        }

        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token!" });
    }
};

export const createRefreshToken = async (userId: number): Promise<string> => {
    await prisma.refreshToken.deleteMany({
        where: {
            userId: userId
        }
    });
    
    const refreshToken = jwt.sign(
        { userId }, 
        JWT_REFRESH_SECRET, 
        { expiresIn: '1h' }
    );
    
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: userId
        }
    });
    
    return refreshToken;
};

export const cleanupExpiredTokens = async (): Promise<void> => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    await prisma.refreshToken.deleteMany({
        where: {
            createdAt: {
                lt: oneHourAgo
            }
        }
    });
};