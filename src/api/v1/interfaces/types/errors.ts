/**
    @description Global types not specific to components. Specific types/models/classes are defined in the component's dir
*/

/**
 * Custom error definitions. I like custom errors
 */
export enum ErnoCode {
    // General error codes
    METHOD_MUST_BE_OVERRIDEN,

    // Environment error codes
    ENVIRONMENT_NOT_FOUND,                 // Environment not defined in .env file
    DB_CONNECTION_STRING_NOT_FOUND,        // Database Connection String not defined in .env file
    API_BASE_URL_NOT_FOUND,                // API URL not defined in .env file
    DB_NAME_NOT_FOUND,                     // Database name not defined in .env file
    DB_COLLECTION_NAME_NOT_FOUND,          // Database collection name not defined in .env

    // Database error codes
    CLIENT_NOT_CONNECTED,                  // Program did not connect to the client yet
}

export class Erno {
    code: ErnoCode;
    message?: string;
    extras?: any;

    constructor(
        code: ErnoCode,
        message: string | undefined = undefined,
        extras: any = undefined
    ) {
            this.code = code;
            this.message = message;
            this.extras = extras;
    }
}