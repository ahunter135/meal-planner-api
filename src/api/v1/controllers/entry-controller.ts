import { Request, Response } from "express";
import { Singleton } from '../interfaces/module';
import { Mapper } from '../services/module';
import { EntryService } from "../services/module";

export class EntryController extends Singleton {
    private static instance: EntryController;

    // Services
    private _mapper: Mapper = Mapper.getInstance();
    private _entryService: EntryService = EntryService.getInstance();

    public static getInstance(): EntryController {
        if (!EntryController.instance) EntryController.instance = new EntryController();
        return EntryController.instance;
    }

    private constructor() { super(); }

    public async deleteEntry(req: Request, res: Response): Promise<Response> {
        const email = req.body["email"];
        const entryId = req.body["entryId"];

        if (!entryId || !email) {
            return res.status(400).send("Email and entryId are required");
        }
        const serviceResponse = await this._entryService.deleteEntry(email, entryId);
        return res.status(serviceResponse.status).send(serviceResponse.message);
    }
}