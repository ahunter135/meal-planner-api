
/**
 * @description Ensures the email is defined and a string
 * @param email 
 * @returns true if the email is a string and not undefined, false otherwise
 */
export const isEmailFormatValid = (email: any): boolean => {
    if (!email || (email && typeof email !== "string")) {
        return false;
    }
    return true;
}

/**
 * @description Validates the email
 * @param email 
 * @returns true if valid, false otherwise
 */
export const isEmailValid = (email: any): boolean => {
    if (!isEmailFormatValid(email)) {
        return false;
    }
    const isValid = String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    
    return isValid ? true : false;
}