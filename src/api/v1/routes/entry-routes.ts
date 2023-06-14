import express, { Router, Request, Response } from "express";
import { EntryController } from "../controllers/module";
import { AuthMiddleware } from "../middlewares/module";

const router: Router = express.Router();
const controller: EntryController = EntryController.getInstance();

const authMiddleware: AuthMiddleware = AuthMiddleware.getInstance();

// Defined Entry route middlwares
router.use(authMiddleware.handle);

// Gets entry data
router.get('/', async (req: Request, res: Response) => {
    throw new Error("Not implemented");
});

router.delete('/', async (req: Request, res: Response) => {
    return await controller.deleteEntry(req, res);
});

export { router as default };