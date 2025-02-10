import { Action } from "./action";
import { Condition } from "./condition";
import { State } from "./state";
import { Target } from "./target";
// TODO: update jsdoc
interface CommandInput {
  target: Target;
  conditions: Condition[]; // TODO: define conditions
  action: Action; // TODO: define actions
  actionTarget?: Target;
}

/**
 * Represents a command in the Dungeon Commander game.
 *
 * @class Command
 * @property {Target} target - The primary target of the command.
 * @property {string} conditions - The conditions under which the command is executed. TODO: Define conditions.
 * @property {string} action - The action to be performed by the command. TODO: Define actions.
 * @property {Target} [actionTarget] - An optional secondary target for the action.
 *
 * @constructor
 * @param {CommandInput} input - The input parameters for the command.
 *
 * @method identifyTarget
 * @private
 * @param {Target} target - The target to identify.
 * @param {State} state - The current state of the game.
 * @param {{id: number, side: 'party' | 'enemies'}} actor - The actor performing the command.
 * @returns {Array<{id: number, side: 'party' | 'enemies'}>} - An array of identified targets.
 * @throws {Error} Throws an error if the target base is invalid.
 */
export class Command {
  target: Target;
  conditions: Condition[]; // TODO: define conditions
  action: Action; // TODO: define actions
  actionTarget?: Target;
  constructor(input: CommandInput) {
    this.target = input.target;
    this.conditions = input.conditions;
    this.action = input.action;
    this.actionTarget = input.actionTarget;
  }

  private identifyTarget(
    target: Target,
    state: State,
    actor: { id: number; side: "party" | "enemies" }
  ) {
    if (target.qualifier) {
      return [target.qualifier.check(target, state)];
    }
    switch (target.base) {
      case "ally":
        if (actor.side === "party") {
          return state.characters.party.map((character) => {
            return { id: character.character.id, side: "party" };
          });
        }
        return state.characters.enemies.map((character) => {
          return { id: character.character.id, side: "enemies" };
        });
      case "enemy":
        if (actor.side === "party") {
          return state.characters.enemies.map((character) => {
            return { id: character.character.id, side: "enemies" };
          });
        }
        return state.characters.party.map((character) => {
          return { id: character.character.id, side: "party" };
        });
      case "self":
        return [actor];
      case "all":
        return [
          ...state.characters.party.map((character) => {
            return { id: character.character.id, side: "party" };
          }),
          ...state.characters.enemies.map((character) => {
            return { id: character.character.id, side: "enemies" };
          }),
        ];
      default:
        throw new Error(`Invalid target base: ${target.base}`);
    }
  }
  public checkConditions(
    state: State,
    actor: { id: number; side: "party" | "enemies" }
  ) {
    return this.conditions.every((condition) => condition.check(actor, state));
  }
  // TODO: Implement the execute method
  public pushToActive(
    state: State,
    actor: { id: number; side: "party" | "enemies" }
  ) {
    let actionTarget;
    if (this.actionTarget) {
      actionTarget = this.identifyTarget(this.actionTarget, state, actor);
    }
    const targets = this.identifyTarget(this.target, state, actor);
    const context = { actionTarget, actor };
    state.addAction(this.action, context);
  }
}
