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
    return (
      acc +
      `${it.section} = ${it.count ?? 1},${it.scope ? " scope," : ""}${it.silencer ? " silencer," : ""} prob = ${
        it.probability ?? 1
      } \\n${lineEnding}`
    );
  }, "");
}
