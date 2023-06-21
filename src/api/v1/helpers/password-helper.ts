import { Singleton } from "../interfaces/module";
import * as bcrypt from 'bcrypt';
 
export class PasswordHelper extends Singleton {
    private static instance: PasswordHelper;

    public static getInstance(): PasswordHelper {
        if (!PasswordHelper.instance) PasswordHelper.instance = new PasswordHelper();
        return PasswordHelper.instance;
    }
    private constructor() { super(); }

    /**
     * @description Compares two passwords
     * @param hashedPassword Password that is already hashed (most likely from mongodb doc)
     * @param plainTextPassword Unhashed password (probably from the user's request)
     * @returns true if they match, false otherwise
     */
    public async comparePasswords(
        hashedPassword: string,
        plainTextPassword: string
        ): Promise<boolean> {
        return bcrypt.compare(plainTextPassword, hashedPassword);
    }

    /**
     * @description Hashes a plaintext password using bcrypt
     * @param password plaintext password to be hashed
     * @returns A hashed password
     */
    public async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }
}