import { TCount, TName, TRate, TSection } from "@/engine/lib/types";

/**
 * Descriptor of generic loadout item.
 * Used for `[spawn]` sections description generation.
 */
export interface ISpawnItemDescriptor {
  cond?: TRate;
  count?: TCount;
  launcher?: boolean;
  probability?: TRate;
  scope?: boolean;
  section: TSection;
  silencer?: boolean;
}

/**
 * Create list of items for character descriptions.
 * Uses `[spawn]` section as string destination.
 *
 * @returns stringified loadout items list
 */
export function createSpawnList(descriptors: Array<ISpawnItemDescriptor>, lineEnding: string = "\n"): string {
  return descriptors.reduce((acc, it) => {
    let current: string = `${it.section} = ${it.count ?? 1}`;

    if (it.scope) {
      current += ", scope";
    }

    if (it.silencer) {
      current += ", silencer";
    }

    if (it.launcher) {
      current += ", launcher";
    }

    if (typeof it.probability === "number" && it.probability !== 1) {
      current += `, prob=${it.probability}`;
    }

    if (typeof it.cond === "number" && it.cond !== 1) {
      current += `, cond=${it.cond}`;
    }

    return acc + current + ` \\n${lineEnding}`;
  }, "");
}

/**
 * Descriptor of generic loadout item.
 * Used for `[spawn]` sections description generation.
 */
export interface ILoadoutItemDescriptor {
  ammoType?: number;
  cond?: TRate;
  count?: TCount;
  launcher?: boolean;
  level?: TName;
  scope?: boolean;
  section: TSection;
  silencer?: boolean;
}

/**
 * Create list of items for character descriptions.
 * Uses `[spawn_loadout]` section as string destination.
 *
 * @returns stringified loadout items list
 */
export function createSpawnLoadout(descriptors: Array<ILoadoutItemDescriptor>, lineEnding: string = "\n"): string {
  return descriptors.reduce((acc, it) => {
    let current: string = `${it.section}=${it.count ?? 1}`;

    if (it.scope) {
      current += ", scope";
    }

    if (it.silencer) {
      current += ", silencer";
    }

    if (it.launcher) {
      current += ", launcher";
    }

    if (it.ammoType) {
      current += `, ammo_type=${it.ammoType}`;
    }

    if (typeof it.cond === "number" && it.cond !== 1) {
      current += `, cond=${it.cond}`;
    }

    if (it.level) {
      current += `, level=${it.level}`;
    }

    return acc + current + ` \\n${lineEnding}`;
  }, "");
}
