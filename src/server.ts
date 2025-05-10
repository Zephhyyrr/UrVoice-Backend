import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import speechRoutes from "./models/speech.routes";

dotenv.config();

const app = express();
app.use(express.json()); 

app.use("/api/users", authRoutes); 
app.use("/api/articles", articleRoutes);
app.use("/api/models", speechRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status ? Number(err.status) : 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
