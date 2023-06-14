import express, { Router, Request, Response } from "express";
import { UserController } from "../controllers/module";
import { AuthMiddleware } from "../middlewares/module";

const router: Router = express.Router();
const controller: UserController = UserController.getInstance();

const authMiddleware: AuthMiddleware = AuthMiddleware.getInstance();

// Gets user data with email as query parameter
router.get('/', authMiddleware.handle, async (req: Request, res: Response) => {
    return await controller.getUser(req, res);
});

// Creates a new user
// Does not have authorization middleware duh
router.post('/', async (req: Request, res: Response) => {
    return await controller.createUser(req, res);
});

// Replaces a user
router.put('/', authMiddleware.handle, async (req: Request, res: Response) => {
    return await controller.putUser(req, res);
});

export { router as default };