import { Request, Response } from "express";
import { Singleton } from '../interfaces/module';
import { AuthService, Mapper } from '../services/module';

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
    
        if (await this._authService.login(userFromRequest.email, userFromRequest.password)) {
            return res.status(200).send(userFromRequest);
        } else {
            return res.status(401).send("Email and/or password does not match any account.")
        }
    }
}