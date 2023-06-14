import { Database } from "../../../config/database";
import { Singleton } from "../interfaces/module";
import { Erno, ErnoCode } from "../interfaces/types/module";
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

    /**
     * @description Checks if refresh token is in the database
     * @param token 
     * @returns true if token is in the database
     */
    public async doesRefreshTokenExist(token: string): Promise<boolean> {
        const result = await this.db.refreshTokenCollection.findOne({});

        const tokens = this.mapper.mapDocumentToRefreshTokens(result);

        if (!tokens || !tokens.refreshTokens) {
            throw new Erno(ErnoCode.COLLECTION_OR_DOCUMENT_NOT_SETUP);
        }

        if (tokens.refreshTokens.includes(token)) return true;
        return false;
    }

    /**
     * @description Adds the refresh token is in the database
     * @param token 
     * @returns true if token is added successfully
     */
    public async addRefreshToken(token: string): Promise<boolean> {
        const res = await this.db.refreshTokenCollection.updateOne(
            {},
            { $push: { refreshTokens: token } }
        );
        return res.modifiedCount !== 0;
    }

    /**
     * @description Deletes the refresh token is in the database
     * @param token 
     * @returns true if token is deleted successfully
     */
    public async deleteRefreshToken(token: string): Promise<boolean> {
        const res = await this.db.refreshTokenCollection.updateOne(
            {},
            { $pull: { refreshTokens: token } }
        );
        return res.modifiedCount !== 0;
    }
}