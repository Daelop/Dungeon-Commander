import { State } from "./state";
import { Target } from "./target";

interface CommandInput {
    target: Target;
    conditions: string; // TODO: define conditions
    action: string; // TODO: define actions
    actionTarget?: Target;
}

export class Command {
    target: Target;
    conditions: string; // TODO: define conditions
    action: string; // TODO: define actions
    actionTarget?: Target;
constructor(input: CommandInput) {
    this.target = input.target;
    this.conditions = input.conditions;
    this.action = input.action;
    this.actionTarget = input.actionTarget;
}

private identifyTarget(target: Target, state: State, actor: {id: number, side: 'party' | 'enemies'}) {
    if (target.qualifier) {
        return [target.qualifier.check(target, state)];
    }
    switch (target.base) {
        case 'ally':
            if (actor.side === 'party') {
                return state.characters.party.map((character) => { return {id:character.character.id, side: 'party'}});
            }
            return state.characters.enemies.map((character) => { return {id:character.character.id, side: 'enemies'}});
        case 'enemy':
            if (actor.side === 'party') {
                return state.characters.enemies.map((character) => {return {id:character.character.id, side: 'enemies'}});
            }
            return state.characters.party.map((character) => { return {id:character.character.id, side: 'party'}});
        case 'self':
            return [actor];
        case 'all':
            return [...state.characters.party.map((character) => { return {id:character.character.id, side: 'party'}}), ...state.characters.enemies.map((character) => { return {id:character.character.id, side: 'enemies'}})];
        default:
            throw new Error(`Invalid target base: ${target.base}`);    
        }
}

}