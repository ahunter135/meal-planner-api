import { Request, Response } from "express";
import { Singleton } from '../interfaces/module';
import { Mapper } from '../services/module';
import { isEmailFormatValid, isEmailValid } from "../helpers/module";
import { UserService } from "../services/module";

export class UserController extends Singleton {
    private static instance: UserController;

    // Services
    private _mapper: Mapper = Mapper.getInstance();
    private _userService: UserService = UserService.getInstance();

    public static getInstance(): UserController {
        if (!UserController.instance) UserController.instance = new UserController();
        return UserController.instance;
    }
    private constructor() { super(); }

    public async getUser(req: Request, res: Response): Promise<Response> {
        let email = req.query.email;
        if (!isEmailFormatValid(email)) {
            return res.status(400).send("Email is either not provided or an invalid format");
        }

        const user = await this._userService.getUser(email as string);
        if (!user) {
            return res.status(401).send("No Account Found");
        }
        return res.send(user);
    }

    public async createUser(req: Request, res: Response): Promise<Response> {
        let email = req.body.email;
        let password = req.body.password;
        if (!isEmailValid(email)) {
            return res.status(400).send("Email is not valid");
        }

        const serviceResponse = await this._userService.createUser(email, password);
        // Send user if success, message otherwise
        return res.status(serviceResponse.status).send(
            serviceResponse.extras ? serviceResponse.extras : serviceResponse.message
        );
    }

    public async putUser(req: Request, res: Response): Promise<Response> {
        let email = req.body["user"].email;
        if (!isEmailFormatValid(email)) {
            return res.status(400).send("Email is either not provided or an invalid format");
        }

        const putResponse = await this._userService.putUser(email as string);

        return res.status(putResponse.status).send(putResponse.message);
    }
}