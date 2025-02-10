import { Character, DamageType } from "../types/character";

interface scaling {
    [stat: string]: number;
}
export interface statusEffectInput {
    name: string;
    description: string;
    duration: number;
    frequency: number;
    context: Record<string, unknown>;
    effect: (context: Record<string,unknown>) => void;
    removeEffect?: (context: Record<string,unknown>) => void;
}

export function handleDamage(context:{character: Character, baseDamage: number, type:DamageType, scaling: scaling,targets:Character[]}): void {
    const {character, baseDamage, type, scaling, targets} = context;
    // Calculate the scaled damage
    let scaledDamage = baseDamage;
    for (const stat in scaling) {
        scaledDamage += character.statBlock[stat] * scaling[stat];
    }
    
    // Apply the damage to each target
    targets.forEach(target => {
        const damageRoll = Math.floor((Math.random() * (1.2-0.8) + 0.8)*scaledDamage);
        target.takeDamage(damageRoll, type);
    });
}

export function handleHeal(context:{character: Character, baseHeal: number, scaling:scaling, targets:Character[]}): void {
    const {character, baseHeal, scaling, targets} = context;
    let healedAmount = baseHeal;
    // Calculate the scaled heal
    if (scaling) {
        for (const stat in scaling) {
            healedAmount += character.statBlock[stat] * scaling[stat];
        }
    }
    // Apply the heal to each target
    targets.forEach(target => {
        // Apply a random factor to the heal amount
        const healRoll = Math.floor((Math.random() * (1.2-0.8) + 0.8)*healedAmount);
        // Apply the heal to the target
        target.heal(healRoll);
    });
    
}

export function snapshotHoT(context:{character: Character, baseHeal: number, scaling?:scaling}): number {
    const {character, baseHeal, scaling} = context;
    let healedAmount = baseHeal;
    // Calculate the scaled heal
    if (scaling) {
        for (const stat in scaling) {
            healedAmount += character.statBlock[stat] * scaling[stat];
        }
    }
    return healedAmount;
}

export function snapshotDoT(context:{character: Character, baseDamage: number, type:DamageType, scaling?: scaling}): number {
    const {character, baseDamage, type, scaling} = context;
    // Calculate the scaled damage
    let scaledDamage = baseDamage;
    if (scaling) {
        for (const stat in scaling) {
            scaledDamage += character.statBlock[stat] * scaling[stat];
        }
    }
    return scaledDamage;
}
// this will happen each tick of the HoT
export function handleHotTick(context:{healedAmount: number, target: Character}): void {
    const {healedAmount, target} = context;
    // Apply a random factor to the heal amount
    const healRoll = Math.floor((Math.random() * (1.2-0.8) + 0.8)*healedAmount);
    // Apply the heal to the target
    target.heal(healRoll);
}

export function handleDotTick(context:{damage: number, type:DamageType, target: Character}): void {
    const {damage, type, target} = context;
    // Apply a random factor to the damage amount
    const damageRoll = Math.floor((Math.random() * (1.2-0.8) + 0.8)*damage);
    // Apply the damage to the target
    target.takeDamage(damageRoll, type);
}

export function handleStatusEffect(statusEffectInput: statusEffectInput, target: Character, initialTickCount:number, currentTickCount:number): boolean {
    const ticksPassed = currentTickCount - initialTickCount;
    if (statusEffectInput.frequency === 0 && ticksPassed === 0) {
        statusEffectInput.effect(statusEffectInput.context);
    }
    if ( ticksPassed % statusEffectInput.frequency === 0) {
        statusEffectInput.effect(statusEffectInput.context);
    }
    if (ticksPassed >= statusEffectInput.duration) {
        if (statusEffectInput.removeEffect) {
            statusEffectInput.removeEffect(statusEffectInput.context);
        }
        console.log(`${target.name} has recovered from ${statusEffectInput.name}`);
        return true
    } else {
        return false
    }
}

