import { Environment } from "./environment";
import * as mongoDb from "mongodb";
import { Erno, ErnoCode } from "../api/v1/interfaces/types/module";
import { Singleton } from "../api/v1/interfaces/module";

export class Database extends Singleton {
    private static instance: Database;

    private client?: mongoDb.MongoClient;

    private _environment: Environment = Environment.getInstance();

    private _db?: mongoDb.Db;
    public get db(): mongoDb.Db {
        if (!this.client) {
            throw new Erno(ErnoCode.CLIENT_NOT_CONNECTED, "The method \'initializeDatabase\' must be called first.");
        }
        if (!this._db) {
            this._db = this.client.db(this._environment.DB_NAME);
        }
        return this._db;
    }

    private _userCollection?: mongoDb.Collection;
    public get userCollection(): mongoDb.Collection {
        if (!this._userCollection) {
            const collectionName = this._environment.DB_USER_COLLECTION_NAME;
            this._userCollection = this.db.collection(collectionName);
        }
        return this._userCollection;
    }

    private _refreshTokenCollection?: mongoDb.Collection;
    public get refreshTokenCollection(): mongoDb.Collection {
        if (!this._refreshTokenCollection) {
            const collectionName = this._environment.DB_REFRESH_TOKEN_COLLECTION_NAME;
            this._refreshTokenCollection = this.db.collection(collectionName);
        }
        return this._refreshTokenCollection;
    }

    private constructor() { super(); }

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async initializeDatabase() {
        console.log("Initializing database connection.");
        this.client = new mongoDb.MongoClient(this._environment.DB_CONN_STRING);

        await this.client.connect();
    }
}