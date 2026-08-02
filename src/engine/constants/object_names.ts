/**
 * Named game objects used outside the story-object registry.
 *
 * @virtual
 */
export const objectNames = {
  pri_a15_door: "pri_a15_door",
} as const;

export type TObjectNames = typeof objectNames;

export type TObjectName = TObjectNames[keyof TObjectNames];
