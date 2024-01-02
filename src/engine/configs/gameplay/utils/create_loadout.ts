/**
 * Descriptor of generic loadout item.
 */
export interface ILoadoutItemDescriptor {
  section: string;
  count?: number;
  scope?: boolean;
  silencer?: boolean;
  probability?: number;
}

/**
 * @returns stringified loadout items list
 */
export function createLoadout(descriptors: Array<ILoadoutItemDescriptor>, lineEnding: string = "\r\n"): string {
  return descriptors.reduce((acc, it) => {
    let current: string = it.section;

    if (typeof it.count === "number" && it.count !== 1) {
      current += ` = ${it.count}`;
    }

    if (it.scope) {
      current += ", scope";
    }

    if (it.silencer) {
      current += ", silencer";
    }

    if (typeof it.probability === "number" && it.probability !== 1) {
      current += `, prob = ${it.probability}`;
    }

    return acc + current + ` \\n${lineEnding}`;
  }, "");
}
