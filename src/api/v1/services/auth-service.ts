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

    public async login(email: string, password: string): Promise<boolean> {
        const user = await this._userRepository.getUser({ email: email });
        if (user && user.password && (await this._passwordHelper.comparePasswords(user.password, password))) {
            return true;
        }
        // Need to add refresh token and access token here

        return false;
    }

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
        response = buildSuccessResponse(response, "");
        response.extras = newAccessToken;
        return response;
    }
}