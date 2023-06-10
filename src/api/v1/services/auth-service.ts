//import { UserRepository } from "../../user/repository";
import { Singleton } from "../interfaces/module";
import { UserRepository } from "../repositories/user-repository";

export class AuthService extends Singleton {
    private static instance: AuthService;

    private userRepository: UserRepository = UserRepository.getInstance();

    private constructor() { super(); }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        } 
        return AuthService.instance;
    }

    public async login(email: string, password: string): Promise<boolean> {
        const user = await this.userRepository.getUser({ email: email });
        if (user && user.password === btoa(password)) {
            return true;
        }

        return false;
    }

}