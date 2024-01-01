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
export function createLoadout(descriptors: Array<ILoadoutItemDescriptor>): string {
  return descriptors.reduce((acc, it) => {
    return acc + `${it.section} = ${it.count ?? 1}${it.probability ? `, prob=${it.probability}` : ""} \\n\r\n`;
  }, "");
}
