import { Request, Response } from "express";
import { Mapper } from "../../../services/mapper";
import { AuthorizeService } from "./services/auth";

export const login = async (req: Request, res: Response): Promise<Response> => {
    const mapper = Mapper.getInstance();

    const userFromRequest = mapper.mapRequestToUser(req);

    if (!userFromRequest.email || !userFromRequest.password) {
        return res.status(400).send("Email and password not provided in the request.");
    }

    if (await AuthorizeService.getInstance().login(userFromRequest.email, userFromRequest.password)) {
        return res.status(200).send(userFromRequest);
    } else {
        return res.status(401).send("Email and/or password does not match any account.")
    }
}