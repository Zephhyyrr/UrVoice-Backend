import { Router } from "express";
import { getAllHistory, getHistoryById } from "../controllers/history.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/history", authenticateToken, getAllHistory);

router.get("/history/:id", authenticateToken, getHistoryById);

export default router;