import { PrismaClient } from '@prisma/client';
import { ResponseError } from '../error/response.error';

const prisma = new PrismaClient();

export const getAllHistory = async (userId: number) => {
    try {
        await prisma.$connect();

        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            throw new ResponseError(404, "User not found");
        }

        const history = await prisma.history.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return history;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }

        if ((error as any)?.name === 'PrismaClientKnownRequestError') {
            throw new ResponseError(500, `Database error: ${(error as any)?.message || 'Unknown error'}`);
        }

        throw new ResponseError(500, "Failed to fetch history");
    }
};

export const getHistoryById = async (userId: number, historyId: number) => {
    try {
        const history = await prisma.history.findUnique({
            where: { id: historyId, userId },
        });

        if (!history) {
            throw new ResponseError(404, "History not found");
        }

        return history;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError(500, "Failed to fetch history");
    }
};

export const createHistory = async (
    userId: number,
    fileAudio: string,
    originalParagraph: string,
    correctedParagraph: string,
    grammarAnalysis?: any
) => {
    try {
        const history = await prisma.history.create({
            data: {
                userId,
                fileAudio,
                originalParagraph,
                correctedParagraph,
                grammarAnalysis,
            }
        });

        return history;
    } catch (error) {
        throw new ResponseError(500, "Failed to create history");
    }
};

export const deleteHistory = async (userId: number, historyId: number) => {
    try {
        const history = await prisma.history.findUnique({
            where: { id: historyId, userId },
        });

        if (!history) {
            throw new ResponseError(404, "History not found");
        }

        await prisma.history.delete({
            where: { id: historyId, userId }
        });

        return { message: "History deleted successfully" };
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError(500, "Failed to delete history");
    }
};
