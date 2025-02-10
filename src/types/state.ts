import {
  handleStatusEffect,
  statusEffectInput,
} from "../handlers/effectHandlers";
import { Action } from "./action";
import { Character } from "./character";
// TODO: add jsdoc
interface characterState {
  position: { x: number; y: number };
  character: Character;
}

interface actionState {
  context: Record<string, unknown>;
  action: Action;
  initialTick: number;
}

interface effectState {
  effect: statusEffectInput;
  initialTick: number;
  target: Character;
}

export class State {
  characters: {
    party: characterState[];
    enemies: characterState[];
  };
  size: { x: number; y: number };
  tickCount: number;
  activeActions: actionState[];
  activeEffects: effectState[];
  constructor(
    party: Character[],
    enemies: Character[],
    size: { x: number; y: number }
  ) {
    this.characters = {
      party: party.map((character) => ({
        character,
        position: { x: 0, y: 0 },
      })),
      enemies: enemies.map((character) => ({
        character,
        position: { x: 0, y: 0 },
      })),
    };
    this.tickCount = 0;
    this.activeActions = [];
  }

  private setInitalPositions() {
    this.characters.party.forEach((character, index) => {
      character.position = { x: index, y: 0 };
    });
    this.characters.enemies.forEach((character, index) => {
      character.position = { x: index, y: 1 };
    });
  }
  private getCharacterbyId(id: number, side: "party" | "enemies") {
    return this.characters[side].find(
      (character) => character.character.id === id
    );
  }

  private getCharacterPosition(id: number, side: "party" | "enemies") {
    const character = this.getCharacterbyId(id, side);
    if (!character) {
      throw new Error(`Character with id ${id} not found`);
    }
    return character.position;
  }

  private calculateMovement(direction: number, distance: number) {
    // Calculate the x and y movement
    // TODO: check if this math is correct
    const x = Math.round(Math.cos(direction) * distance);
    const y = Math.round(Math.sin(direction) * distance);
    return { x, y };
  }

  public moveCharacter(
    id: number,
    side: "party" | "enemies",
    distance: number,
    direction: number
  ) {
    // Get the character's position
    const position = this.getCharacterPosition(id, side);
    let { x, y } = this.calculateMovement(direction, distance);
    // Update the position
    position.x += x;
    position.y += y;
    // Check if the position is out of bounds
    if (position.x < 0) {
      position.x = 0;
    }
    if (position.x >= this.size.x) {
      position.x = this.size.x - 1;
    }
    if (position.y < 0) {
      position.y = 0;
    }
    if (position.y >= this.size.y) {
      position.y = this.size.y - 1;
    }
  }

  private checkResult() {
    // Check if all enemies are dead
    if (this.characters.enemies.every((enemy) => !enemy.character.isAlive)) {
      return 1;
    }
    // Check if all party members are dead
    if (this.characters.party.every((party) => !party.character.isAlive)) {
      return -1;
    }
    return 0;
  }

  public addEffect(effect: statusEffectInput, target: Character) {
    this.activeEffects.push({ effect, initialTick: this.tickCount, target });
  }

  public addAction(action: Action, context: Record<string, unknown>) {
    this.activeActions.push({ action, context, initialTick: this.tickCount });
  }

  // check that this works because object comparison is weird
  public removeEffect(effect: statusEffectInput) {
    this.activeEffects = this.activeEffects.filter(
      (activeEffect) => activeEffect.effect !== effect
    );
  }
  private removeAction(action: Action) {
    this.activeActions = this.activeActions.filter(
      (activeAction) => activeAction.action !== action
    );
  }

  private resolveActions() {
    if (this.activeActions.length === 0) {
      return;
    }
    this.activeActions.forEach((activeAction) => {
      const { action, context } = activeAction;
      const result = action.effects(context);
      if (result) {
        this.removeAction(action);
      }
    });
  }

  private resolveEffects() {
    if (this.activeEffects.length === 0) {
      return;
    }
    this.activeEffects.forEach((activeEffect) => {
      const { effect, initialTick, target } = activeEffect;
      const { duration, frequency, context } = effect;
      const result = handleStatusEffect(
        effect,
        target,
        initialTick,
        this.tickCount
      );
      if (result) {
        this.removeEffect(activeEffect.effect);
      }
    });
  }

  private tick() {
    this.tickCount++;
    // get each alive character to choose an action
    this.characters.party
      .filter((character) => character.character.isAlive)
      .forEach((character) => {
        character.character.chooseAction(this);
      });
    this.characters.enemies
      .filter((character) => character.character.isAlive)
      .forEach((character) => {
        character.character.chooseAction(this);
      });
    // advance each action and remove them if they return true
    this.resolveActions();
    this.resolveEffects();
    // check for win or lose conditions
    // return a different value for each condition 1 = win, 0 = continue, -1 = lose
    return this.checkResult();
  }
  // add more methods here
  public init() {
    this.setInitalPositions();
  }

  public run() {
    // do something to signal the start of the battle
    let result = 0;
    while (result === 0) {
      setTimeout(() => {
        result = this.tick();
      }, 1000);
    }
  }
}
