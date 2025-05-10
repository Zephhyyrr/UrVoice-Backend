import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";
import { authenticateToken } from "../middleware/auth";
import { ResponseError } from "../error/response.error";
import { upload } from "../middleware/upload";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const create: RequestHandler[] = [
    authenticateToken,
    upload.single("image"),
    async (req, res, next) => {
        const { title, content } = req.body;
        const image = req.file?.filename ? `${uuidv4()}${path.extname(req.file.filename)}` : null;

        try {
            if (!title || !content || !image) {
                throw new ResponseError(400, "Title, content, and image are required");
            }

            const article = await prisma.article.create({
                data: {
                    title,
                    content,
                    image,
                },
            });

            res.status(201).json({
                success: true,
                message: "Article successfully created",
                data: article,
            });
        } catch (error) {
            next(error);
        }
    },
];

export const update: RequestHandler[] = [
    authenticateToken,
    upload.single("image"),
    async (req, res, next) => {
        const { id } = req.params;
        const { title, content } = req.body;
        const newImage = req.file?.filename ? `${uuidv4()}${path.extname(req.file.filename)}` : null;

        try {
            if (!title || !content) {
                throw new ResponseError(400, "Title and content are required");
            }

            const oldArticle = await prisma.article.findUnique({
                where: { id: Number(id) },
            });

            if (!oldArticle) {
                throw new ResponseError(404, "Article not found");
            }

            if (newImage && oldArticle.image) {
                const oldPath = path.join(__dirname, "../../public/uploads", oldArticle.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            const updatedArticle = await prisma.article.update({
                where: { id: Number(id) },
                data: {
                    title,
                    content,
                    image: newImage ?? oldArticle.image,
                },
            });

            res.status(200).json({
                success: true,
                message: "Article successfully updated",
                data: updatedArticle,
            });
        } catch (error) {
            next(error);
        }
    },
];

export const get: RequestHandler[] = [authenticateToken, async (req, res) => {
    try {
        const articles = await prisma.article.findMany();
        res.status(200).json({
            success: true,
            message: "Articles retrieved successfully",
            data: articles,
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    }
}];

export const getById: RequestHandler[] = [authenticateToken, async (req, res, next) => {
    const { id } = req.params;

    try {
        const article = await prisma.article.findUnique({
            where: { id: Number(id) },
        });

        if (!article) {
            res.status(404).json({ error: "Article not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Article retrieved successfully",
            data: article,
        });
    } catch (error) {
        next(error);
    }
}];

export const deleteArticle: RequestHandler[] = [authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const articleToDelete = await prisma.article.findUnique({
            where: { id: Number(id) },
        });

        if (!articleToDelete) {
            throw new ResponseError(404, "Article not found");
        }

        if (articleToDelete.image) {
            const imagePath = path.join(__dirname, "../../public/uploads", articleToDelete.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.article.delete({
            where: { id: Number(id) },
        });

        res.status(204).json({
            success: true,
            message: "Article successfully deleted",
        });
    } catch (error) {
        if (error instanceof ResponseError) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Failed to delete article" });
        }
    }
}];
