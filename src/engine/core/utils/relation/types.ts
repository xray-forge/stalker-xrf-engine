import type { TRelationType } from "@/engine/lib/types";

/**
 * Relation type between two game objects.
 */
export enum ERelation {
  ENEMY = "enemy",
  NEUTRAL = "neutral",
  FRIEND = "friend",
}

/**
 * Goodwill breakpoints for relation points between game objects.
 */
export enum EGoodwill {
  BEST_FRIENDS = 5000,
  FRIENDS = 1000,
  NEUTRALS = 0,
  ENEMIES = -1000,
  WORST_ENEMIES = -5000,
}

/**
 * Map for simple transformation of TRelationType enum to ERelation.
 */
export const mapRelationTypeToEnum: Record<TRelationType, ERelation> = {
  [0]: ERelation.FRIEND,
  [1]: ERelation.NEUTRAL,
  [2]: ERelation.ENEMY,
  [3]: ERelation.ENEMY,
};
