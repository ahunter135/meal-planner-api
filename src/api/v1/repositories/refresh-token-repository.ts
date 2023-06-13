import { Database } from "../../../config/database";
import { Singleton } from "../interfaces/module";
import { Mapper } from "../services/module";

export class RefreshTokenRepository extends Singleton {
    private db: Database = Database.getInstance();
    private mapper: Mapper = Mapper.getInstance();

    private static instance: RefreshTokenRepository;

    private constructor() { super(); }

    public static getInstance(): RefreshTokenRepository {
        if (!RefreshTokenRepository.instance) {
            RefreshTokenRepository.instance = new RefreshTokenRepository();
        }
        return RefreshTokenRepository.instance;
    }

    public async doesRefreshTokenExist(token: string): Promise<boolean> {
        throw new Error("Unimplemented bc I have headache. Just need interface for now.")
    }

    public async addRefreshToken(token: string): Promise<boolean> {
        throw new Error("Unimplemented bc I have headache. Just need interface for now.")
    }

    public async deleteRefreshToken(token: string): Promise<boolean> {
        throw new Error("Unimplemented bc I have headache. Just need interface for now.")
    }
}