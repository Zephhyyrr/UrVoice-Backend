import { Router } from "express";
import { createArticle, updateArticle, getArticles, getArticleById, deleteArticle
} from "../controllers/article.controller";
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post("/create", authenticateToken, upload.single("image"), createArticle);
router.put("/update/:id", authenticateToken, upload.single("image"), updateArticle);
router.get("/getAll", authenticateToken, getArticles);
router.get("/getArticle/:id", authenticateToken, getArticleById);
router.delete("/delete/:id", authenticateToken, deleteArticle);

export default router;
