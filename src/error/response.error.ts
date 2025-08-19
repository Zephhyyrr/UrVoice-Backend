import { Response } from "express";
import { ResponseApiType } from "../types/api_types";

export class ResponseError extends Error {
    public errors?: any[];
    public statusCode?: number;

    constructor(messsage: string, statusCode?: number, errors?: any[]) {
        super(messsage)
        this.errors = errors;
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, ResponseError.prototype)
        Error.captureStackTrace(this, this.constructor)
    }
}

export const handlerAnyError = (error: any, res: Response<ResponseApiType>) => {
    if (error instanceof ResponseError) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message,
            errors: error.errors
        })
    }
    console.log(error.message);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    })
}