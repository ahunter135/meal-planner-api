import { Middleware, Singleton } from "../interfaces/module";
import { Request, Response } from "express";

export class AuthMiddleware extends Singleton implements Middleware {
    private static instance: AuthMiddleware;

    public static getinstance(): AuthMiddleware {
        if (!AuthMiddleware.instance) {
            AuthMiddleware.instance = new AuthMiddleware();
        }
        return AuthMiddleware.instance;
    }

    private constructor() { super(); }

    /**
     * @description Middleware for authorizing a user. Just checks that their credentials are valid, nothing more.
     * @param req 
     * @param res 
     * @param next 
     */
    public handle(req: Request, res: Response, next: Function): void {

    }
}