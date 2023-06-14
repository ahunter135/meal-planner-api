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
        // Also need to check repository to see if it exists
        const tupleResponse = this.verifyToken(token, this.environment.REFRESH_TOKEN_SECRET);
        return tupleResponse[0];
    }

    /**
     * @description Generates an accesss token.
     * @param email 
     * @returns A jwt token string
     */
    generateAccessToken(email: string) {
        return jwt.sign({ email: email }, this.environment.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    }

    /**
     * @description Verifies an access token
     * @param token 
     * @returns The email or undefined if the token is expired
     * @throws An error if the token is invalid for a reason other than being expired
     */
    verifyAccessToken(token: string): string | undefined {
        const tupleResponse = this.verifyToken(token, this.environment.ACCESS_TOKEN_SECRET);
        const email: string | undefined = tupleResponse[0];
        const err: any = tupleResponse[1];
        if (err && err.name == "TokenExpiredError") {
            return undefined;
        } else if (!err && email) {
            return email;
        } else {
            throw err;
        }
    }

    private verifyToken(token: string, secret: string): [string | undefined, any] {
        try {
            const res = jwt.verify(token, secret);
            let email = '';
            if (typeof res === 'string') {
                email = res;
            } else {
                email = res.email;
            }
            return [email, undefined];
        } catch (e: any) {
            return [undefined, e];
        }
    }

}