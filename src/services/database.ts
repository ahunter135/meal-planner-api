import { Environment } from "../environment";
import * as mongoDb from "mongodb";
import { Erno, ErnoCode } from "../types";

export class Database {
    private static instance: Database;

    private client?: mongoDb.MongoClient;

    private _db?: mongoDb.Db;
    public get db(): mongoDb.Db {
        if (!this.client) {
            throw new Erno(ErnoCode.CLIENT_NOT_CONNECTED, "The method \'initializeDatabase\' must be called first.");
        }
        if (!this._db) {
            const environment = Environment.getInstance();
            this._db = this.client.db(environment.DB_NAME);
        }
        return this._db;
    }

    private _collection?: mongoDb.Collection;
    public get collection(): mongoDb.Collection {
        if (!this._collection) {
            const collectionName = Environment.getInstance().DB_COLLECTION_NAME;
            this._collection = this.db.collection(collectionName);
        }
        return this._collection;
    }

    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async initializeDatabase() {
        const environment = Environment.getInstance();
        this.client = new mongoDb.MongoClient(environment.DB_CONN_STRING);

        await this.client.connect();
    }
}