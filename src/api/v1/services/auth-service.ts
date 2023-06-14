import { PasswordHelper, buildBaseResponse, buildResponse, buildSuccessResponse } from "../helpers/module";
import { Singleton } from "../interfaces/module";
import { ServiceResponseDto } from "../interfaces/types/module";
import { RefreshTokenRepository } from "../repositories/module";
import { UserRepository } from "../repositories/user-repository";
import { JWTService } from "./module";

export class AuthService extends Singleton {
    private static instance: AuthService;

    private _userRepository: UserRepository = UserRepository.getInstance();
    private _passwordHelper: PasswordHelper = PasswordHelper.getInstance();
    private _refreshTokenRepository: RefreshTokenRepository = RefreshTokenRepository.getInstance();
    private _jwtService: JWTService = JWTService.getInstance();

    private constructor() { super(); }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        } 
        return AuthService.instance;
    }

    /**
     * @description Logs the user in and returns a refresh and access token
     * @param email 
     * @param password 
     * @returns A Dto object with "accessToken" and "refreshToken" in the extras if successful
     */
    public async login(email: string, password: string): Promise<ServiceResponseDto> {
        let res = buildBaseResponse();

        const user = await this._userRepository.getUser({ email: email });
        if (!(user && user.password && (await this._passwordHelper.comparePasswords(user.password, password)))) {
            return buildResponse("Email or password is incorrect", 404, false, res);
        }
        // Need to add refresh token and access token here
        // TODO: Remember to delete refresh token from cookies when user is logged out
        const refreshToken = this._jwtService.generateRefreshToken(email);
        const accessToken = this._jwtService.generateAccessToken(email);

        const successFullyAddedRefreshToken = await this._refreshTokenRepository.addRefreshToken(refreshToken);

        if (!successFullyAddedRefreshToken) {
            return buildResponse("An error occurred logging the user in", 500, false, res);
        }

        res = buildSuccessResponse(res);
        res.extras = {
            accessToken,
            refreshToken,
        };
        return res;
    }

    /**
     * @description Logs the user out by invalidating their refresh token
     * @param accessToken 
     * @param refreshToken 
     * @returns A dto object 
     */
    public async logout(refreshToken: string): Promise<ServiceResponseDto> {
        let response = buildBaseResponse();

        const isValidRefreshToken = this._refreshTokenRepository.doesRefreshTokenExist(refreshToken);
        if (!isValidRefreshToken) {
            return buildResponse("Refresh token invalid", 401, false, response);
        }

        await this._refreshTokenRepository.deleteRefreshToken(refreshToken);


        return buildSuccessResponse(response, "Successfully logged out");
    }

    /**
     * @description Generates a new access token for the user
     * @param refreshToken 
     * @returns 
     */
    async generateNewAccessToken(refreshToken: string): Promise<ServiceResponseDto> {
        let response = buildBaseResponse();

        const isValidRefreshToken = await this._refreshTokenRepository.doesRefreshTokenExist(refreshToken);

        if (!isValidRefreshToken) {
            return buildResponse("Refresh token invalid", 401, false, response);
        }

        const email = this._jwtService.verifyRefreshToken(refreshToken);
        if (!email) {
            return buildResponse("Refresh payload invalid", 400, false, response);
        }

        const newAccessToken = this._jwtService.generateAccessToken(email);
        response = buildSuccessResponse(response);
        response.extras = newAccessToken;
        return response;
    }
}