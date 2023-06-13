import { ArrayEntry, User } from "../models/module";

/**
 * @description Takes an array of objects with an id field and removes the value passed in from the array
 * @param values Array of objects with an id field
 * @param valueToRemove Object with id field to be removed
 * @returns A tuple [boolean: isSuccessful, ArrayEntry[] | undefined: array without object or undefined]
 */
export const deleteEntryFromUserArrayField = async (values: ArrayEntry[] | undefined, valueToRemove: ArrayEntry | string): Promise<[boolean, ArrayEntry[] | undefined]> => {
    if (typeof valueToRemove != "string") {
        valueToRemove = valueToRemove.id ?? '';
    }

    if (!values || (values && values?.length === 0)) {
        return [false, values];
    }
    const newValues = values.filter(value => value.id !== valueToRemove);
    return [true, newValues];
}

/**
 * @description Creates a fresh user object for insertng into the database
 * @param email 
 * @param password 
 * @returns A User
 */
export const createBlankUser = (email: string, password: string): object => {
    return {
        email,
        password,
        entries: [],
        mustHaves: [],
        shareCode: generateShareCode(),
        usedShareCode: undefined,
        recipes: []
    };
}

/**
 * @description Generates a share code for a user
 * @returns A generated share code
 * @notes IDK how this should look
 */
const generateShareCode = (): string => {
    return '';
}