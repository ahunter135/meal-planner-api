import { PasswordHelper, buildBaseResponse, buildNotFoundResponse, buildResponse, buildSuccessResponse } from "../helpers/module";
import { Singleton } from "../interfaces/module";
import { ServiceResponseDto } from "../interfaces/types/module";
import { User } from "../models/module";
import { UserRepository } from "../repositories/user-repository";

export class UserService extends Singleton {
    private static instance: UserService;

    private _userRepository: UserRepository = UserRepository.getInstance();
    private _passwordHelper: PasswordHelper = PasswordHelper.getInstance();

    private constructor() { super(); }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        } 
        return UserService.instance;
    }

    public async getUser(email: string): Promise<User | undefined> {
        return this._userRepository.getUser({ email: email });
    }

    public async createUser(email: string, password: string): Promise<ServiceResponseDto> {
        let response: ServiceResponseDto = buildBaseResponse();

        const checkUser = await this.getUser(email);
        if (checkUser) { // User already exists
            return buildResponse("User with that email already exists", 400, false, response);
        }
        const user = this._userRepository.createUser(email, await this._passwordHelper.hashPassword(password));
        if (!user) {
            response = buildResponse("Action failed", 500, false, response);
        } else {
            response = buildSuccessResponse(response, "Account successfully created");
            response.extras = user;
        }

        return response;
    }

    public async putUser(email: string): Promise<ServiceResponseDto> {
        const user = await this.getUser(email as string);
        const response: ServiceResponseDto = buildBaseResponse();

        if (!user) {
            return buildNotFoundResponse(response, "User not found");
        } else {
            if (await this._userRepository.replaceUser(user, { email: email })){
                return buildSuccessResponse(response);
            } else {
                response.message = "There was an error replacing the user.";
                response.status = 500;
            }
        }
        return response;
    }
}