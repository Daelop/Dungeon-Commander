import { State } from "./state";

export interface Condition {
    name: string;
    check: (context: unknown, state:State) => boolean;
}