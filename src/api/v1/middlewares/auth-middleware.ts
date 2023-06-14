import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "../../../config/constants";
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
     * @description Middleware for authorizing a user. Checks that their access token is valid, nothing more.
     * @param req 
     * @param res 
     * @param next 
     */
    public handle(req: Request, res: Response, next: Function): void {
        let accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME] as string | undefined;
        if (!accessToken) {
            if(req.headers.authorization) {
                accessToken = req.headers.authorization
            } else {
                res.status(401).send("Access token not provided as cookie or authorization header");
            }
        }
        const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
        if (!refreshToken) {
            res.status(401).send("Refresh token not provided as cookie or authorization header");
        }
    }
}