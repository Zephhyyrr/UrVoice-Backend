import axios from 'axios';
import FormData from 'form-data';
import { Express } from 'express';

const FLASK_API_BASE_URL = 'http://127.0.0.1:5051';

export const speechService = {
    async speechToText(file: Express.Multer.File) {
        if (!file || !file.buffer) {
            throw new Error("File is missing or not in correct format");
        }

        const formData = new FormData();
        formData.append('audio', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const response = await axios.post(`${FLASK_API_BASE_URL}/speech-to-text`, formData, {
            headers: formData.getHeaders(),
        });

        return response.data;
    },

    async analyzeSpeech(text: string, file?: Express.Multer.File) {
        const formData = new FormData();
        formData.append('text', text);
        
        if (file) {
            formData.append('audio', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }
    
        const response = await axios.post(`${FLASK_API_BASE_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
        });
    
        return response.data;
    }
};
