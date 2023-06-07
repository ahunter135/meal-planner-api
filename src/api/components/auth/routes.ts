import express, { Router, Request, Response } from "express";
import { login } from "./controller";

const router: Router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    return await login(req, res);
});

// For legacy support
router.post('/loginToMeal', async (req: Request, res: Response) => {
    return await login(req, res);
});

module.exports = router;