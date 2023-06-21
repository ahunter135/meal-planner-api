require("dotenv").config();
import { Erno, ErnoCode } from "../api/v1/interfaces/types/module";

// Type that specifies variables about the current environment
export class Environment {
    private static instance: Environment;

    private constructor() { }

    public static getInstance(): Environment {
        if (!Environment.instance) {
            Environment.instance = new Environment();
        }
        return Environment.instance;
    }

    public get ENVIRONMENT(): string {
        const env = process.env.ENVIRONMENT;
        if (!env) throw new Erno(ErnoCode.ENVIRONMENT_NOT_FOUND);
        return env;
    }

    public get DB_CONN_STRING(): string {
        let dbConnString = this.environmentVarHelper(process.env.DB_CONN_STRING, process.env.DB_CONN_STRING_DEV);
        if (!dbConnString) throw new Erno(ErnoCode.DB_CONNECTION_STRING_NOT_FOUND);
        return dbConnString;
    }

    public get API_BASE_URL(): string {
        let apiBaseUrl = this.environmentVarHelper(process.env.API_BASE_URL, process.env.API_BASE_URL_DEV);
        if (!apiBaseUrl) throw new Erno(ErnoCode.API_BASE_URL_NOT_FOUND);
        return apiBaseUrl;
    }

    public get API_PORT(): number {
        let apiPort = this.environmentVarHelper(process.env.API_PORT, process.env.API_PORT_DEV);
        if (!apiPort) throw new Erno(ErnoCode.API_PORT_NOT_FOUND);
        return parseInt(apiPort);
    }

    public get DB_NAME(): string {
        let dbName = this.environmentVarHelper(process.env.DB_NAME, process.env.DB_NAME_DEV);
        if (!dbName) throw new Erno(ErnoCode.DB_NAME_NOT_FOUND);
        return dbName;
    }

    public get DB_USER_COLLECTION_NAME(): string {
        let dbCollectionName = this.environmentVarHelper(process.env.DB_USER_COLLECTION_NAME, process.env.DB_USER_COLLECTION_NAME_DEV);
        if (!dbCollectionName) throw new Erno(ErnoCode.DB_COLLECTION_NAME_NOT_FOUND);
        return dbCollectionName;
    }

    public get DB_REFRESH_TOKEN_COLLECTION_NAME(): string {
        let dbCollectionName = this.environmentVarHelper(process.env.DB_REFRESH_TOKEN_COLLECTION_NAME, process.env.DB_REFRESH_TOKEN_COLLECTION_NAME_DEV);
        if (!dbCollectionName) throw new Erno(ErnoCode.DB_COLLECTION_NAME_NOT_FOUND);
        return dbCollectionName;
    }

    public get ACCESS_TOKEN_SECRET(): string {
        let accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) throw new Erno(ErnoCode.ACCESS_TOKEN_SECRET_NOT_FOUND);
        return accessTokenSecret;
    }

    public get REFRESH_TOKEN_SECRET(): string {
        let refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshTokenSecret) throw new Erno(ErnoCode.REFRESH_TOKEN_SECRET_NOT_FOUND);
        return refreshTokenSecret;
    }

    private environmentVarHelper(prod: string | undefined, dev: string | undefined): string | undefined {
        if (this.ENVIRONMENT == 'dev') return dev;
        else if (this.ENVIRONMENT == 'prod') return prod;
        throw new Erno(ErnoCode.ENVIRONMENT_NOT_FOUND);
    }
}