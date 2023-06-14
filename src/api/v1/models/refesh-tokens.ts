import { ObjectId } from "mongodb";

/**
 * @description Type that reflects a user as defined in the current meal_planner docs 6/7/2023
 * @todo Some are probably not required so figure out which ones can be undefined
 */
export type RefreshTokens = {
    _id?: string | ObjectId;
    refreshTokens?: string[];
}