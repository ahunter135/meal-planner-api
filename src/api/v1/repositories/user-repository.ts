import { Database } from "../../../config/database";
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
}