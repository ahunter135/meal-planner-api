import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "../../../config/constants";
import { Middleware, Singleton } from "../interfaces/module";
import { Request, Response } from "express";
import { TokenFromRequestDto } from "../interfaces/types/module";
import { JWTService } from "../services/module";
import { getTokensFromRequest, setCookie } from "../helpers/module";

export class AuthMiddleware extends Singleton implements Middleware {
    private static instance: AuthMiddleware;

    public static getInstance(): AuthMiddleware {
        if (!AuthMiddleware.instance) {
            AuthMiddleware.instance = new AuthMiddleware();
        }
        return AuthMiddleware.instance;
    }

    private _jtwService: JWTService = JWTService.getInstance();

    private constructor() { super(); }

    /**
     * @description Middleware for authorizing a user. Checks that their access token is valid.
     * If it is expired, the method will attempt to generate a new one from the refresh token.
     * @param req 
     * @param res 
     * @param next 
     */
    public handle(req: Request, res: Response, next: Function): void {
        const tokenResponse = getTokensFromRequest(req);
        if (!tokenResponse.accessToken || !tokenResponse.refreshToken) {
            res.status(401).send(tokenResponse.message ?? "Tokens not provided");
            return;
        }

        let email = undefined;
        try { email = this._jtwService.verifyAccessToken(tokenResponse.accessToken) }
        // Access token is invalid for a reason other than being expired
        catch (err) {
            res.status(401).send("Error verifying access token");
            return;
        }
        if (!email) {
            // Block of code respobile for generating a new access token from the refresh token
            const emailFromRefresh = this._jtwService.verifyRefreshToken(tokenResponse.refreshToken);
            if (!emailFromRefresh) {
                res.status(401).send("Access token expired and refresh token is invalid");
                return;
            }
            const newlyGeneratedAccessToken = this._jtwService.generateAccessToken(emailFromRefresh);
            res = setCookie(res, ACCESS_TOKEN_COOKIE_NAME, newlyGeneratedAccessToken);
            email = emailFromRefresh;
        }

        // Set values in req so controllers can use them
        req.body.email = email;
        if (req.body["user"]) {
            req.body["user"].email = email;
        }
        next();
        return;
    }
}