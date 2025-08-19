import prisma from '../config/prisma';
import { ResponseError } from '../error/response.error';

export const getAllHistory = async (userId: number) => {
    try {
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            throw new ResponseError("User not found", 404);
        }

        const history = await prisma.history.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const transformedHistory = history.map(item => ({
            ...item,
            fileAudio: `/uploads/${item.fileAudio}`
        }));

        return transformedHistory;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }

        if ((error as any)?.name === 'PrismaClientKnownRequestError') {
            throw new ResponseError(`Database error: ${(error as any)?.message || 'Unknown error'}`, 500);
        }

        throw new ResponseError("Failed to fetch history", 500);
    }
};

export const getHistoryById = async (userId: number, historyId: number) => {
    try {
        const history = await prisma.history.findUnique({
            where: { id: historyId, userId },
        });

        if (!history) {
            throw new ResponseError("History not found", 404);
        }

        const transformedHistory = {
            ...history,
            fileAudio: `/uploads/${history.fileAudio}`
        };

        return transformedHistory;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError("Faied to fetch history", 500);
    }
};

export const createHistory = async (
    userId: number,
    fileAudio: string,
    originalParagraph: string,
    correctedParagraph: string = "",
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
        throw new ResponseError("Failed to create history", 500);
    }
};

export const updateHistory = async (
    userId: number,
    fileAudio: string,
    correctedParagraph: string,
    grammarAnalysis?: any
) => {
    try {
        const existingHistory = await prisma.history.findFirst({
            where: {
                userId,
                fileAudio,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!existingHistory) {
            throw new ResponseError("History not found for update", 404);
        }

        const updatedHistory = await prisma.history.update({
            where: {
                id: existingHistory.id
            },
            data: {
                correctedParagraph,
                grammarAnalysis,
                updatedAt: new Date()
            }
        });

        return updatedHistory;
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError("Failed to update history", 500);
    }
};

export const deleteHistory = async (userId: number, historyId: number) => {
    try {
        const history = await prisma.history.findUnique({
            where: { id: historyId, userId },
        });

        if (!history) {
            throw new ResponseError("History not found", 404);
        }

        await prisma.history.delete({
            where: { id: historyId, userId }
        });

        return { message: "History deleted successfully" };
    } catch (error) {
        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError("Failed to delete history", 500);
    }
};