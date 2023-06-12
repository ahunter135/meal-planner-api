import { Request, Response } from "express";
import { Singleton } from '../interfaces/module';
import { Mapper } from '../services/module';
import { MustHaveService } from "../services/module";

export class MustHaveController extends Singleton {
    private static instance: MustHaveController;

    // Services
    private _mapper: Mapper = Mapper.getInstance();
    private _mustHaveService: MustHaveService = MustHaveService.getInstance();

    public static getInstance(): MustHaveController {
        if (!MustHaveController.instance) MustHaveController.instance = new MustHaveController();
        return MustHaveController.instance;
    }
    private constructor() { super(); }

    public async deleteMustHave(req: Request, res: Response): Promise<Response> {
        const email = req.body["email"];
        const mustHaveId = req.body["mustHaveId"];

        if (!mustHaveId || !email) {
            return res.status(400).send("Email and mustHaveId are required");
        }
        const serviceResponse = await this._mustHaveService.deleteMustHave(email, mustHaveId);
        return res.status(serviceResponse.status).send(serviceResponse.message);
    }
}