import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import speechRoutes from "./models/speech.routes";
import historyRoutes from "./routes/history.routes";
import path from "path";
import { handlerAnyError } from "./error/response.error";

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan("dev")); 

app.use("/api/users", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/models", speechRoutes);
app.use("/api/history", historyRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));


export default app;
