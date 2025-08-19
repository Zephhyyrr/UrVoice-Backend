import prisma from "../config/prisma";
import { ResponseError } from "../error/response.error";
import * as fs from "fs/promises";
import * as path from "path";

const uploadsFolder = path.join(__dirname, "../../public/uploads");

export async function createArticleService(
    title: string,
    content: string,
    urlArticle: string,
    imageFilename?: string
) {
    if (!title || !content) {
        throw new ResponseError("Title and content are required", 400);
    }

    if (!imageFilename) {
        throw new ResponseError("Image file is required", 400);
    }

    const article = await prisma.article.create({
        data: {
            title,
            content,
            urlArticle: urlArticle || "", // kasih default kalau kosong
            image: imageFilename,
        },
    });

    return article;
}

export async function updateArticleService(
    id: number,
    title: string,
    content: string,
    urlArticle: string,
    newFilename?: string
) {
    if (!title || !content) {
        throw new ResponseError("Title and content are required", 400);
    }

    const oldArticle = await prisma.article.findUnique({ where: { id } });
    if (!oldArticle) {
        throw new ResponseError("Article not found", 404);
    }

    let imageToSave = oldArticle.image;

    if (newFilename) {
        imageToSave = newFilename;

        if (oldArticle.image) {
            try {
                await fs.unlink(path.join(uploadsFolder, oldArticle.image));
            } catch {
                // abaikan error jika file sudah tidak ada
            }
        }
    }

    const updated = await prisma.article.update({
        where: { id },
        data: {
            title,
            content,
            urlArticle: urlArticle || oldArticle.urlArticle,
            image: imageToSave,
        },
    });

    return updated;
}

export async function getAllArticlesService() {
    return prisma.article.findMany();
}

export async function getArticleByIdService(id: number) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new ResponseError("Article not found", 404);
    return article;
}

export async function deleteArticleService(id: number) {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new ResponseError("Article not found", 404);

    if (article.image) {
        try {
            await fs.unlink(path.join(uploadsFolder, article.image));
        } catch {
            // abaikan error jika file tidak ada
        }
    }

    await prisma.article.delete({ where: { id } });
    return true;
}
