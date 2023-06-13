import { Environment } from "../../../config/environment";
import { Singleton } from "../interfaces/module";
import jwt, { JwtPayload } from "jsonwebtoken";

export class JWTService extends Singleton {
    private static instance: JWTService;

    private constructor() { super(); }

    public static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        } 
        return JWTService.instance;
    }

    environment: Environment = Environment.getInstance();
    
    /**
     * @description Generates a refresh token. Refresh tokens don't expire, but are stored on the backend and used for refreshing access tokens.
     * @param email 
     * @returns A jwt token string
     */
    generateRefreshToken(email: string): string {
        return jwt.sign({ email: email }, this.environment.REFRESH_TOKEN_SECRET);
    }

    /**
     * @description Verifies a refresh token and returns the email inside the payload.
     * @param token 
     * @returns An email or undefined
     */
    verifyRefreshToken(token: string): string | undefined {
        try {
            const res = jwt.verify(token, this.environment.REFRESH_TOKEN_SECRET);
            if (typeof res === 'string') {
                return res;
            } else {
                return res.email;
            }
        } catch (e) {
            return undefined;
        }
    }

    /**
     * @description Generates an accesss token.
     * @param email 
     * @returns A jwt token string
     */
    generateAccessToken(email: string) {
        return jwt.sign({ email: email }, this.environment.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    }

}