import { Response } from "express";
import { Erno, ErnoCode } from "../interfaces/types/module";

export const setCookie = (res: Response, cookieName: string, cookieValue: any): Response => {
    res.cookie(cookieName, cookieValue, {
        httpOnly: true // Might neet to alter these idk tho
    });
    return res;
}

export const setCookies = (res: Response, cookieNames: string[], cookieValues: any[]): Response => {
    if (cookieNames.length !== cookieValues.length) {
        throw new Erno(ErnoCode.ARRAYS_MUST_HAVE_SAME_LENGTH, "cookieNames and cookievalues must be the same length");
    }

    for (let i = 0; i < cookieNames.length; i++) {
        res.cookie(cookieNames[i], cookieValues[i], {
            httpOnly: true // Might neet to alter these idk tho
        });
    }
    return res;
}