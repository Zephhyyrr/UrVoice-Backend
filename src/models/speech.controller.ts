import { RequestHandler } from 'express';
import { speechService } from './speech.service';
import { createHistory, updateHistory } from '../services/history.service';

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
        const { text, audioFileName } = req.body;

        if (!text) {
            res.status(400).json({
                success: false,
                message: "Text is required for analysis"
            });
        }

        const data = await speechService.analyzeSpeech(text, audioFileName);


        res.status(200).json({
            success: true,
            message: "Analysis successful",
            data,
        });
    } catch (error) {
        next(error);
    }
};