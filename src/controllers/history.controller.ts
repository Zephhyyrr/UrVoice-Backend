import { RequestHandler } from "express";
import * as historyService from "../services/history.service";
import { ResponseError } from "../error/response.error";

export const getAllHistory: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: "Authentication required"
            });
            return;
        }

        const userId = (req.user as { userId: number }).userId;

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                success: false,
                error: "Invalid user ID"
            });
            return;
        }

        const history = await historyService.getAllHistory(userId);

        res.status(200).json({
            success: true,
            message: "History retrieved successfully",
            data: history,
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to fetch history"
            });
        }
    }
};

export const getHistoryById: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const userId = (req.user as { userId: number }).userId;
        const historyId = Number(req.params.id);

        if (isNaN(historyId)) {
            res.status(400).json({
                success: false,
                error: "Invalid history ID"
            });
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
            res.status(error.status).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to fetch history"
            });
        }
    }
};

export const saveHistory: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const userId = (req.user as { userId: number }).userId;
        const { audioFileName, originalText, correctedText } = req.body;

        if (!audioFileName || !originalText || !correctedText) {
            res.status(400).json({
                success: false,
                error: "Audio file name, original text, and corrected text are required"
            });
            return;
        }

        const history = await historyService.createHistory(
            userId,
            audioFileName,
            originalText,
            correctedText
        );

        res.status(201).json({
            success: true,
            message: "History saved successfully",
            data: history
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to save history"
            });
        }
    }
};

export const deleteHistory: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const userId = (req.user as { userId: number }).userId;
        const historyId = Number(req.params.id);

        if (isNaN(historyId)) {
            res.status(400).json({
                success: false,
                error: "Invalid history ID"
            });
            return;
        }

        const result = await historyService.deleteHistory(userId, historyId);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: "Failed to delete history"
            });
        }
    }
};
