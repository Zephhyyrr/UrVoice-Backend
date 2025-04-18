import { RequestHandler } from 'express';
import { speechService } from '../models/speechService';

export const speechToText: RequestHandler = async (req, res, next) => {
    try {
        const result = await speechService.speechToText(req.file!);
        res.status(200).json({
            success: true,
            message: "Transcription successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const analyzeSpeech: RequestHandler = async (req, res, next) => {
    try {
        const result = await speechService.analyzeSpeech(req.body.text, req.file);
        res.status(200).json({
            success: true,
            message: "Analysis successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
