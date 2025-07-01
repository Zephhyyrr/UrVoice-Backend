import { RequestHandler } from 'express';
import { speechService } from './speech.service';
import { createHistory } from '../services/history.service';

export const speechToText: RequestHandler = async (req, res, next) => {
    try {
        const data = await speechService.speechToText(req.file!);

        const userId = (req as any).user?.userId;

        console.log("🎯 userId from token (req.user.userId):", userId); // DEBUG LOG

        if (userId) {
            await createHistory(
                Number(userId),
                data.audioFileName,
                data.text, // hasil transkrip dari Flask (bukan `data.transcript`)
                "" // corrected paragraph masih kosong
            );
        } else {
            console.warn("⚠️ userId dari token tidak ditemukan. History tidak disimpan.");
        }

        res.status(200).json({
            success: true,
            message: "Transcription successful",
            data,
        });
    } catch (error) {
        next(error);
    }
};


export const analyzeSpeech: RequestHandler = async (req, res, next) => {
    try {
        const { text, audioFileName } = req.body;
        const userId = (req as any).user?.id || req.body?.userId;

        if (!text) {
            res.status(400).json({
                success: false,
                message: "Text is required for analysis"
            });
        }

        const data = await speechService.analyzeSpeech(text, audioFileName);

        console.log("📦 Grammar Analysis:", data.grammar_analysis);

        if (userId && audioFileName) {
            await createHistory(
                userId,
                audioFileName,
                text,
                data.data.corrected_paragraph,
                data.data.grammar_analysis
            );
        }

        res.status(200).json({
            success: true,
            message: "Analysis successful",
            data,
        });
    } catch (error) {
        next(error);
    }
};
