import { ArrayEntry } from "./module";

export type Entry = ArrayEntry & {
    week?: string | Date;
    description?: string;
}