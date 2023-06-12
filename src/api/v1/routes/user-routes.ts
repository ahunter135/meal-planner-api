import express, { Router, Request, Response } from "express";
import { UserController } from "../controllers/module";

const router: Router = express.Router();
const controller: UserController = UserController.getInstance();

// Gets user data with email as query parameter
router.get('/user', async (req: Request, res: Response) => {
    return await controller.getUser(req, res);
});

// Creates a new user
router.post('/user', async (req: Request, res: Response) => {
    return await controller.createUser(req, res);
});

router.put('/user', async (req: Request, res: Response) => {
    return await controller.putUser(req, res);
});

export { router as default };