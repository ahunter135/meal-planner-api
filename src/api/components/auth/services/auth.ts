import { UserRepository } from "../../user/repository";

export class AuthorizeService {
    private static instance: AuthorizeService;

    private userRepository: UserRepository = UserRepository.getInstance();

    private constructor() { }

    public static getInstance(): AuthorizeService {
        if (!AuthorizeService.instance) {
            AuthorizeService.instance = new AuthorizeService();
        } 
        return AuthorizeService.instance;
    }

    public async login(email: string, password: string): Promise<boolean> {
        const user = await this.userRepository.getUser({ email: email });
        if (user && user.password === btoa(password)) {
            return true;
        }

        return false;
    }

}