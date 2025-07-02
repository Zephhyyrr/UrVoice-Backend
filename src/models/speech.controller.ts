import { RequestHandler } from 'express';
import { speechService } from './speech.service';
import { createHistory, updateHistory } from '../services/history.service';

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
        const userId = (req as any).user?.userId || (req as any).user?.id || req.body?.userId;

        if (!text) {
            res.status(400).json({
                success: false,
                message: "Text is required for analysis"
            });
        }

        const data = await speechService.analyzeSpeech(text, audioFileName);

        console.log("📦 Grammar Analysis:", data.grammar_analysis);

        // Update history yang sudah ada (jangan buat baru)
        if (userId && audioFileName) {
            try {
                await updateHistory(
                    Number(userId),
                    audioFileName,
                    data.corrected_paragraph, // Sesuaikan dengan struktur response Flask
                    data.grammar_analysis     // Sesuaikan dengan struktur response Flask
                );
                console.log("✅ History berhasil diupdate untuk audioFileName:", audioFileName);
            } catch (updateError) {
                console.warn("⚠️ Gagal update history:", updateError);
                // Jika update gagal, buat history baru sebagai fallback
                await createHistory(
                    Number(userId),
                    audioFileName,
                    text,
                    data.corrected_paragraph,
                    data.grammar_analysis
                );
            }
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