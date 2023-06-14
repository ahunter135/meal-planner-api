import express, { Router, Request, Response } from "express";
import { AuthController } from "../controllers/module";

const router: Router = express.Router();
const controller: AuthController = AuthController.getInstance();

router.post('/login', async (req: Request, res: Response) => {
    return await controller.login(req, res);
});

router.post('/logout', async (req: Request, res: Response) => {
    return await controller.logout(req, res);
});

router.get('/token', async (req: Request, res: Response) => {
    return await controller.generateNewAccessToken(req, res);
});

export { router as default };