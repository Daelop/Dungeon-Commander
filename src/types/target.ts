import { State } from "./state";

interface Qualifier {
    name: string;
    // TODO define state
    check: (target: Target, state: State ) => number; // returns a character id
}
export interface Target {
    base: 'ally'| 'enemy'| 'self'| 'all';
    qualifier?: Qualifier;
}