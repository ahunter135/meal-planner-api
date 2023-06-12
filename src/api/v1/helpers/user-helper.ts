import { ArrayEntry } from "../models/module";

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