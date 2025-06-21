import express from 'express';
import multer from 'multer';
import { analyzeSpeech, speechToText } from './speech.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer(); // memory storage
    
router.post('/speech-to-text',authenticateToken, upload.single('audio'), speechToText);
router.post('/analyze-speech', authenticateToken, upload.single('audio'), analyzeSpeech);

export default router;
