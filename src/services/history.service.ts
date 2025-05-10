import { PrismaClient } from '@prisma/client'
import { ResponseError } from '../error/response.error';
import { RequestHandler } from 'express';

const prisma = new PrismaClient()

export const getAllHistory = async (userId: number) => {
    try {
        const history = await prisma.history.findMany({
            where: { userId },
        });
        return history;
    } catch (error) {
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
        throw new ResponseError(500, "Failed to fetch history");
    }
};
