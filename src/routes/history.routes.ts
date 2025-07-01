import express from 'express';
import { getAllHistory, getHistoryById, saveHistory, deleteHistory } from '../controllers/history.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route untuk mendapatkan semua history
router.get('/', authenticateToken, getAllHistory);

// Route untuk mendapatkan history berdasarkan ID
router.get('/:id', authenticateToken, getHistoryById);

// Route untuk menyimpan history baru
router.post('/save', authenticateToken, saveHistory);

// Route untuk menghapus history
router.delete('/:id', authenticateToken, deleteHistory);

export default router;