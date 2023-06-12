import express, { Router, Request, Response } from "express";
import { MustHaveController } from "../controllers/module";

const router: Router = express.Router();
const controller: MustHaveController = MustHaveController.getInstance();

// Gets Must Have data
router.get('/entry', async (req: Request, res: Response) => {
    
});

router.delete('/entry', async (req: Request, res: Response) => {
    return await controller.deleteMustHave(req, res);
});

export { router as default };