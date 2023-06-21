import { Request, Response } from "express";

/**
 * @description Interface all cutom middlewares must implement
 */
export interface Middleware {
    /**
     * @description Handles a request
     * @param req 
     * @param res 
     * @param next 
     */
    handle(req: Request, res: Response, next: Function): void;
}