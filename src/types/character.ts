
// The character's current stats
export interface statBlock {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    defense: number;
    magicDefense: number;
    spellSpeed: number;
    attackSpeed: number;
    movementSpeed: number;
}

// The character's growth rate for each stat on level up this will likely be a multiplier rather than a flat number
export interface growthRates {
    maxHp: number;
    maxMp: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    defense: number;
    magicDefense: number;
    spellSpeed: number;
    attackSpeed: number;
    movementSpeed: number;
}
// The input for creating a new character
interface characterInput {
    name: string;
    title: string;
    description: string;
    statBlock: statBlock;
    growthRates: growthRates;
    actions?: string[];
    commands?: string[];
    level?: number;
    exp?: number;
    equipment?: string[]; // to be implemented later
    resistances?: resistances;
}

// The character's resistances to various damage types. These values will be multipliers for damage taken from each type
interface resistances {
    fire: number;
    ice: number;
    lightning: number;
    earth: number;
    water: number;
    wind: number;
    light: number;
    dark: number;
}

// The default resistances for a character
const defaultResistances: resistances = {
    fire: 1,
    ice: 1,
    lightning: 1,
    earth: 1,
    water: 1,
    wind: 1,
    light: 1,
    dark: 1,
}

// The types of damage that can be dealt
type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'earth' | 'water' | 'wind' | 'light' | 'dark';


/**
 * Represents a character in the game.
 * 
 * @class Character
 * @property {number} id - The unique identifier for the character.
 * @property {string} name - The name of the character.
 * @property {string} title - The title of the character.
 * @property {string} description - A brief description of the character.
 * @property {statBlock} statBlock - The stat block containing the character's stats.
 * @property {growthRates} growthRates - The growth rates for the character's stats.
 * @property {string[]} actions - The list of actions the character can perform.
 * @property {string[]} commands - The list of commands the character can execute.
 * @property {number} level - The current level of the character.
 * @property {number} exp - The current experience points of the character.
 * @property {string[]} [equipment] - The list of equipment the character has (optional).
 * @property {resistances} resistances - The resistances of the character to different damage types.
 * @property {boolean} isAlive - Indicates whether the character is alive.
 * 
 * @constructor
 * @param {characterInput} input - The input object containing initial values for the character.
 * 
 * @method calculateDamage
 * @private
 * @param {number} damage - The amount of damage to be calculated.
 * @param {DamageType} type - The type of damage (e.g., physical, fire, ice, etc.).
 * @returns {number} - The calculated damage after applying defenses and resistances.
 * 
 * @method takeDamage
 * @public
 * @param {number} damage - The amount of damage to be taken.
 * @param {DamageType} type - The type of damage (e.g., physical, fire, ice, etc.).
 * @description Reduces the character's HP by the calculated damage and updates the isAlive status.
 * 
 * @method heal
 * @public
 * @param {number} amount - The amount of HP to be healed.
 * @description Increases the character's HP by the specified amount, up to the maximum HP.
 */
export class Character {
id: number;
name: string;
title: string;
description: string;
statBlock: statBlock;
growthRates: growthRates;
actions: string[];
commands: string[];
level: number;
exp: number;
equipment?: string[]; // to be implemented later
resistances: resistances;
isAlive: boolean;

constructor (input: characterInput) {
    this.id = Math.floor(Math.random() * 1000000);
    this.name = input.name;
    this.title = input.title;
    this.description = input.description;
    this.statBlock = input.statBlock;
    this.growthRates = input.growthRates;
    this.actions = input.actions || [];
    this.commands = input.commands || [];
    this.level = input.level || 1;
    this.exp = input.exp || 0;
    this.equipment = input.equipment || [];
    this.resistances = input.resistances || defaultResistances;
    this.isAlive = true;
}

private calculateDamage (damage: number, type:DamageType) {
    // apply defense or magic defense based on damage type
    if (type === 'physical') {
        return damage * (1 - this.statBlock.defense / 100); // TODO: refine this formula and implement penetration
    }
    return (damage * this.resistances[type]) * (1 - this.statBlock.magicDefense / 100); // TODO: refine this formula and implement penetration 
}


public takeDamage (damage: number, type: DamageType) {
    this.statBlock.hp -= this.calculateDamage(damage, type);
    if (this.statBlock.hp <= 0) {
        this.isAlive = false;
    }
    console.log(`${this.name} has taken ${damage} ${type} damage!`);
}

public heal (amount: number) {
    this.statBlock.hp += amount;
    if (this.statBlock.hp > this.statBlock.maxHp) {
        this.statBlock.hp = this.statBlock.maxHp;
    }
    console.log(`${this.name} has been healed for ${amount} HP!`);
}

}