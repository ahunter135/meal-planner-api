import { Database } from "../../../config/database";
import { createBlankUser } from "../helpers/module";
import { Singleton } from "../interfaces/module";
import { User } from "../models/module";
import { Mapper } from "../services/module";

export class UserRepository extends Singleton {
    private db: Database = Database.getInstance();
    private mapper: Mapper = Mapper.getInstance();

    private static instance: UserRepository;

    private constructor() { super(); }

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    /**
     * @description Returns a single user based on a query criteria.
     * @param query Object with query parameters
     * @returns A User object or undefined if no user was found
     */
    async getUser(query: object): Promise<User | undefined> {
        const result = await this.db.collection.findOne(query);

        return this.mapper.mapDocumentToUser(result);
    }

    /**
     * @description Returns an array of users based on a query criteria.
     * @param query **Optional** Object with query parameters
     * @returns An array of User objects
     */
    async getUsers(query: object | undefined = undefined): Promise<User[]> {
        if (query === undefined) query = {};

        const cursor = this.db.collection.find(query);
        let users: User[] = [];

        while (await cursor.hasNext()) {
            const user = this.mapper.mapDocumentToUser(await cursor.next());
            if (user) users.push(user);
        }

        return users;
    }

    /**
     * @description Creates a new user document in the database.
     * @param email Users email
     * @param password **ALREADY HASHED** Password
     * @returns A user or undefined if the action fails
     */
    async createUser(email: string, password: string): Promise<User | undefined> {
        const res = await this.db.collection.insertOne(
            createBlankUser(email, password),
        );

        return this.getUser({ _id: res.insertedId });
    }

    /**
     * @description Replaces a user document with a new one.
     * @param user User document to replace old one
     * @param query Query for finding the original user document. Preferably contains email
     * @returns True if replaces, false otherwise
     */
    async replaceUser(user: User, query: object): Promise<boolean> {
        delete user._id;
        const res = await this.db.collection.replaceOne(query, user);
        return res.modifiedCount === 1;
    }

    /**
     * @description Updates a user's document
     * @param values Fields to be updated with new values
     * @param query Query for finding the original user document. Preferably contains email
     * @returns True if updates a document, false otherwise
     */
    async updateUser(values: User, query: object): Promise<boolean> {
        const result = await this.db.collection.updateOne(query, {
            $set: values,
            $currentDate: { lastModified: true }
        });

        return result.modifiedCount == 1;
    }
}