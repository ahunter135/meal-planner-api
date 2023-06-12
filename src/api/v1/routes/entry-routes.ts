import express, { Router, Request, Response } from "express";
import { EntryController } from "../controllers/module";

const router: Router = express.Router();
const controller: EntryController = EntryController.getInstance();

// Gets entry data
router.get('/entry', async (req: Request, res: Response) => {
    
});

router.delete('/entry', async (req: Request, res: Response) => {
    return await controller.deleteEntry(req, res);
});

export { router as default };