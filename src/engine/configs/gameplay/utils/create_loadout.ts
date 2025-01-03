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
 * Used for `[spawn_loadout]` sections description generation.
 */
export interface ILoadoutItemDescriptor {
  ammoType?: number;
  cond?: TRate;
  count?: TCount;
  launcher?: TRate | boolean;
  level?: TName;
  scope?: TRate | boolean;
  section: TSection;
  silencer?: TRate | boolean;
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

    current += createSpawnLoadoutFlag("scope", it.scope);
    current += createSpawnLoadoutFlag("silencer", it.silencer);
    current += createSpawnLoadoutFlag("launcher", it.launcher);

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

/**
 * Serialize parameter data into loadout string.
 * Format and stringify data to propagate it into c++ engine correctly.
 *
 * @param name - name of the parameter to serialize
 * @param data - value to inject into serialized string
 * @returns raw string part for item field loadout configuration
 */
export function createSpawnLoadoutFlag(name: TName, data?: TRate | boolean): string {
  if (data) {
    if (typeof data === "number") {
      if (data < 0 || data > 1) {
        throw new Error(`Invalid range for scope probability value: ${name} as ${data}`);
      }

      return `, ${name}=${data}`;
    } else {
      return `, ${name}`;
    }
  }

  return "";
}
