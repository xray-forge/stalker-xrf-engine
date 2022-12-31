export const relations = {
  enemy: "enemy",
  friend: "friend"
} as const;

export type TRelations = typeof relations;
export type TRelation = TRelations[keyof TRelations];
