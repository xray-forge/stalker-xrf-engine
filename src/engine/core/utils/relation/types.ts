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
 * Map for simple transformation of ERelation enum to EGoodwill.
 */
export const mapRelationToGoodwill: LuaTable<ERelation, EGoodwill> = $fromObject<ERelation, EGoodwill>({
  [ERelation.ENEMY]: EGoodwill.ENEMIES,
  [ERelation.FRIEND]: EGoodwill.FRIENDS,
  [ERelation.NEUTRAL]: EGoodwill.NEUTRALS,
});
