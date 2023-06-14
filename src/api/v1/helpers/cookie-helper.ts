import { Request, Response } from "express";
import { Erno, ErnoCode, TokenFromRequestDto } from "../interfaces/types/module";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "../../../config/constants";

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

/**
 * @description Responsible for grabbing the access and refresh token from the request
 * @param req 
 * @returns 
 */
export const getTokensFromRequest = (req: Request): TokenFromRequestDto => {
    let res: TokenFromRequestDto = {  }

    let accessToken = req.cookies[ACCESS_TOKEN_COOKIE_NAME] as string | undefined;
    if (!accessToken) {
        if(req.headers.authorization) {
            res.accessToken = req.headers.authorization
        } else {
            res.message = "Access token not provided as cookie or authorization header";
            return res;
        }
    }
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
        res.message = "Refresh token not provided as cookie or authorization header";
        return res;
    }
    res.refreshToken = refreshToken;
    return res;
}