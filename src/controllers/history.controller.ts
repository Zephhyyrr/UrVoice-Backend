import { RequestHandler } from "express";
import * as historyService from "../services/history.service";
import { ResponseError } from "../error/response.error";

export const getAllHistory: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        console.log("=== DEBUG getAllHistory ===");

        // Debug: Cek apakah req.user ada
        console.log("req.user:", req.user);

        if (!req.user) {
            console.log("ERROR: req.user is undefined - authentication failed");
            res.status(401).json({
                success: false,
                error: "Authentication required"
            });
            return;
        }

        const userId = (req.user as { userId: number }).userId;
        console.log("userId from token:", userId);

        if (!userId || isNaN(userId)) {
            console.log("ERROR: Invalid userId:", userId);
            res.status(400).json({
                success: false,
                error: "Invalid user ID"
            });
        }

        console.log("Calling historyService.getAllHistory with userId:", userId);
        const history = await historyService.getAllHistory(userId);
        console.log("History result:", history);

        res.status(200).json({
            success: true,
            message: "History retrieved successfully",
            data: history,
        });
    } catch (error) {
        console.log("=== ERROR in getAllHistory ===");
        console.log("Error type:", typeof error);
        console.log("Error instanceof ResponseError:", error instanceof ResponseError);
        console.log("Full error:", error);

        if (error instanceof ResponseError) {
            console.log("ResponseError - status:", error.status, "message:", error.message);
            res.status(error.status).json({
                success: false,
                error: error.message
            });
        } else {
            console.log("Unknown error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch history",
                debug: error instanceof Error ? error.message : String(error)
            });
        }
    }
};

export const getHistoryById: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        console.log("=== DEBUG getHistoryById ===");

        const userId = (req.user as { userId: number }).userId;
        const historyId = Number(req.params.id);

        console.log("userId:", userId, "historyId:", historyId);

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
        console.log("=== ERROR in getHistoryById ===");
        console.log("Full error:", error);

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
        console.log("=== DEBUG saveHistory ===");

        const userId = (req.user as { userId: number }).userId;
        const { audioFileName, originalText, correctedText } = req.body;

        console.log("Request body:", req.body);
        console.log("userId:", userId);

        // Validasi input
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
        console.log("=== ERROR in saveHistory ===");
        console.log("Full error:", error);

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
        console.log("=== DEBUG deleteHistory ===");

        const userId = (req.user as { userId: number }).userId;
        const historyId = Number(req.params.id);

        console.log("userId:", userId, "historyId:", historyId);

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
        console.log("=== ERROR in deleteHistory ===");
        console.log("Full error:", error);

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