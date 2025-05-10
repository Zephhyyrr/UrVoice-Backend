import { RequestHandler } from 'express';
import { speechService } from './speech.service';

export const speechToText: RequestHandler = async (req, res, next) => {
    try {
        const data = await speechService.speechToText(req.file!);
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
        const data = await speechService.analyzeSpeech(req.body.text, req.file);
        res.status(200).json({
            success: true,
            message: "Analysis successful",
            data,
        });
    } catch (error) {
        next(error);
    }
};
