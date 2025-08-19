import { RequestHandler } from "express";
import {
    createArticleService,
    updateArticleService,
    getAllArticlesService,
    getArticleByIdService,
    deleteArticleService,
} from "../services/article.service";
import { ResponseError } from "../error/response.error";
import { getImageUrl } from "../utils/image";

export const createArticle: RequestHandler = async (req, res, next) => {
    try {
        const { title, content, urlArticle } = req.body;
        const image = req.file?.filename; 

        const article = await createArticleService(title, content, urlArticle, image!);

        res.status(201).json({
            success: true,
            message: "Article successfully created",
            data: {
                ...article,
                imageUrl: getImageUrl(article.image),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateArticle: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ResponseError("Invalid article ID", 400);

        const { title, content, urlArticle } = req.body;
        const filename = req.file?.filename;

        const updated = await updateArticleService(id, title, content, urlArticle, filename);

        res.json({
            success: true,
            message: "Article successfully updated",
            data: {
                ...updated,
                imageUrl: getImageUrl(updated.image),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getArticles: RequestHandler = async (req, res, next) => {
    try {
        const articles = await getAllArticlesService();

        res.json({
            success: true,
            message: "Articles retrieved successfully",
            data: articles.map((a) => ({
                ...a,
                imageUrl: getImageUrl(a.image),
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const getArticleById: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ResponseError("Invalid article ID", 400);

        const article = await getArticleByIdService(id);

        res.json({
            success: true,
            message: "Article retrieved successfully",
            data: {
                ...article,
                imageUrl: getImageUrl(article.image),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteArticle: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ResponseError("Invalid article ID", 400);

        await deleteArticleService(id);

        res.json({
            success: true,
            message: "Article successfully deleted",
        });
    } catch (error) {
        next(error);
    }
};
