/**
 * Descriptor of generic loadout item.
 */
export interface ILoadoutItemDescriptor {
  section: string;
  count?: number;
  probability?: number;
}

/**
 * @returns stringified loadout items list
 */
export function createLoadout(descriptors: Array<ILoadoutItemDescriptor>, lineEnding: string = "\r\n"): string {
  return descriptors.reduce((acc, it) => {
    return acc + `${it.section} = ${it.count ?? 1}, prob = ${it.probability ?? 1} \\n${lineEnding}`;
  }, "");
}
