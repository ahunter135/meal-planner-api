import { Entry } from '../entry/models';
import { MustHave } from '../must-have/models';
import { Recipe } from '../recipe/models';
import { ObjectId } from "mongodb";

/**
 * @description Type that reflects a user as defined in the current meal_planner docs 6/7/2023
 * @todo Some are probably not required so figure out which ones can be undefined
 */
export type User = {
    _id?: string | ObjectId;
    email?: string;
    password?: string;
    entries?: Array<Entry>;
    mustHaves?: Array<MustHave>;
    shareCode?: string;
    usedShareCode?: string;
    recipes?: Array<Recipe>;
}