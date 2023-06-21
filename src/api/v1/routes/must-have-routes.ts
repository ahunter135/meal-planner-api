import express, { Router, Request, Response } from "express";
import { MustHaveController } from "../controllers/module";
import { AuthMiddleware } from "../middlewares/module";

const router: Router = express.Router();
const controller: MustHaveController = MustHaveController.getInstance();

const authMiddleware: AuthMiddleware = AuthMiddleware.getInstance();

// Defined Entry route middlwares
router.use(authMiddleware.handle);

// Gets Must Have data
router.get('/', async (req: Request, res: Response) => {
    throw new Error("Not implemented");
});

router.delete('/', async (req: Request, res: Response) => {
    return await controller.deleteMustHave(req, res);
});

export { router as default };