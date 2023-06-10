import express, { Router, Request, Response } from "express";

const router: Router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    //return await login(req, res);
});

// For legacy support
router.post('/loginToMeal', async (req: Request, res: Response) => {
    //return await login(req, res);
});

export { router as default };