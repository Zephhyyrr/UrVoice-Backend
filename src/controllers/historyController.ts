import { RequestHandler } from "express";
import * as historyService from "../services/historyService";
import { ResponseError } from "../error/responseError";

export const getAllHistory: RequestHandler = async (req, res, next) => { 
    try {
        const userId = (req.user as { userId: number }).userId;
        const history = await historyService.getAllHistory(userId);
        res.status(200).json({
            success: true,
            message: "History retrieved successfully",
            data: history,
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Failed to fetch history" });
        }
    }
};

export const getHistoryById: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req.user as { userId: number }).userId;
        const historyId = Number(req.params.id);
        if (isNaN(historyId)) {
            res.status(400).json({ error: "Invalid history ID" });
            return;
        }
        const history = await historyService.getHistoryById(userId, historyId);
        res.status(200).json({
            success: true,
            message: "History retrieved successfully",
            data: history,
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Failed to fetch history" });
        }
    }
};