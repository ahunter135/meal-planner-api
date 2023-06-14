import { Request, Response } from "express";
import { Singleton } from '../interfaces/module';
import { AuthService, Mapper } from '../services/module';
import { setCookie, setCookies } from '../helpers/module';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "../../../config/constants";

export class AuthController extends Singleton {
    private static instance: AuthController;

    // Services
    private _mapper: Mapper = Mapper.getInstance();
    private _authService: AuthService = AuthService.getInstance();

    public static getInstance(): AuthController {
        if (!AuthController.instance) AuthController.instance = new AuthController();
        return AuthController.instance;
    }
    private constructor() { super(); }

    async login(req: Request, res: Response): Promise<Response> {
        const userFromRequest = this._mapper.mapRequestToUser(req);
    
        if (!userFromRequest.email || !userFromRequest.password) {
            return res.status(400).send("Email and password not provided in the request.");
        }
        const serviceResponse = await this._authService.login(userFromRequest.email, userFromRequest.password);
        if (serviceResponse.success && serviceResponse.extras) {
            // Put access and refresh token in the user's cookies
            res = setCookies(
                res,
                [ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME],
                [serviceResponse.extras.accessToken, serviceResponse.extras.refreshToken]
            );
            return res.status(200).send(userFromRequest);
        } else {
            return res.status(401).send("Email and/or password does not match any account.")
        }
    }

    async generateNewAccessToken(req: Request, res: Response): Promise<Response> {
        const refreshToken: string | undefined | null = req.body.token;
        if (!refreshToken) {
            return res.status(401).send("No token provided");
        }
        const serviceResponse = await this._authService.generateNewAccessToken(refreshToken);
        if (serviceResponse.extras) {
            res = setCookie(
                res,
                ACCESS_TOKEN_COOKIE_NAME,
                serviceResponse.extras
            );
            return res.status(200).send(serviceResponse.extras);
        } else {
            return res.status(500).send("Error generating new access token");
        }
    }
}