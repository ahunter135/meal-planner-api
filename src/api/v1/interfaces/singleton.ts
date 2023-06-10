import { Erno, ErnoCode } from "./types/errors"

export abstract class Singleton {
    public static getInstance(): Singleton {
        throw new Erno(ErnoCode.METHOD_MUST_BE_OVERRIDEN, "Override this the getInstance method.");
    }
}