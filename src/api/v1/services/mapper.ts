import { Request } from "express";
import { WithId, Document } from "mongodb";
import { Singleton } from "../interfaces/module";
import { Entry, MustHave, Recipe, User } from "../models/module";

/**
    @description Class for mapping objects passed through requests to ts/js objects.
 */
export class Mapper extends Singleton {

    private static instance: Mapper;

    private constructor() { super(); }

    public static getInstance(): Mapper {
        if (!Mapper.instance) {
            Mapper.instance = new Mapper();
        }
        return Mapper.instance;
    }

    /**
     * @description Maps request parameters onto the user object. 
     * @param req Express Request with an object "user" in the body.
     * @returns A user object
     */
    mapRequestToUser(req: Request): User {
        return {
            _id: req.body["user"]["_id"],
            email: req.body["user"]["email"],
            password: req.body["user"]["password"],
            entries: req.body["user"]["entries"],
            mustHaves: req.body["user"]["mustHaves"],
            shareCode: req.body["user"]["shareCode"],
            usedShareCode: req.body["user"]["usedShareCode"],
            recipes: req.body["user"]["recipes"],
        }
    }

    /**
     * @description Maps a MongoDb document to a user object
     * @param doc MongoDb document
     * @returns A user object or undefined if no document is provided
     * @todo Cast may not work directly so test it
     */
    mapDocumentToUser(doc: WithId<Document> | null): User | undefined {
        if (!doc) return undefined;
        return doc as User;
    }

    /**
     * @description Maps request parameters onto the entry object. 
     * @param req Express Request with an object "entry" in the body.
     * @returns An Entry object
     */
    mapRequestToEntry(req: Request): Entry {
        return {
            id: req.body["entry"]["id"],
            description: req.body["entry"]["description"],
            week: req.body["entry"]["week"],
        }
    }

    /**
     * @description Maps request parameters onto the recipe object. 
     * @param req Express Request with an object "recipe" in the body.
     * @returns A Recipe object
     */
    mapRequestToRecipe(req: Request): Recipe {
        return {
            week: req.body["recipe"]["week"],
            description: req.body["recipe"]["description"],
            id: req.body["recipe"]["id"],
            isChecked: req.body["recipe"]["isChecked"],
        }
    }

    /**
     * @description Maps request parameters onto the MustHave object. 
     * @param req Express Request with an object "mustHave" in the body.
     * @returns A MustHave object
     */
    mapRequestToMustHave(req: Request): MustHave {
        return {
            
        }
    }
}