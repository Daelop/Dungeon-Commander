import { Action } from "./action";
import { Character } from "./character";

interface characterState {
    position: {x: number, y: number};
    character: Character;
}


interface actionState {
 context: Record<string, unknown>;
 action: Action;
 initalTick: number;
}

export class State {
    characters: {
        party: characterState[];
        enemies: characterState[];
    }
    size: {x: number, y: number};
    tickCount: number;
    activeActions: actionState[];
    constructor(party: Character[], enemies: Character[], size: {x: number, y: number}) {
        this.characters = {
            party: party.map((character) => ({ character, position: {x: 0, y: 0}})),
            enemies: enemies.map((character) => ({ character, position: {x: 0, y: 0}}))
        };
        this.tickCount = 0;
        this.activeActions = [];
    }

    private setInitalPositions() {
        this.characters.party.forEach((character, index) => {
            character.position = {x: index, y: 0};
        });
        this.characters.enemies.forEach((character, index) => {
            character.position = {x: index, y: 1};
        });
  
    }
  private getCharacterbyId(id: number, side: 'party' | 'enemies') {
        return this.characters[side].find((character) => character.character.id === id);
    }

    private getCharacterPosition(id: number, side: 'party' | 'enemies') {
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
        return {x, y};
    }

    public moveCharacter(id: number, side: 'party' | 'enemies', distance: number, direction: number) {
        // Get the character's position
        const position = this.getCharacterPosition(id, side);
        let {x, y} = this.calculateMovement(direction, distance);
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

    private checkResult(){
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

    private tick() {
        this.tickCount++;
        // get each alive character to choose an action
        // advance each action and remove them if they return true
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