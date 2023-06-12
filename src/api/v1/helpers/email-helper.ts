export const isEmailValid = (email: any): boolean => {
    if (!email || (email && typeof email !== "string")) {
        return false;
    }
    return true;
}