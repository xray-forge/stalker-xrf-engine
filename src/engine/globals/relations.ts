export const relations = {
  enemy: "enemy",
  neutral: "neutral",
  friend: "friend",
} as const;

export type TRelations = typeof relations;

export type TRelation = TRelations[keyof TRelations];

export enum ERelation {
  BEST_FRIENDS = 5000,
  FRIENDS = 1000,
  NEUTRALS = 0,
  ENEMIES = -1000,
  WORST_ENEMIES = -5000,
}
