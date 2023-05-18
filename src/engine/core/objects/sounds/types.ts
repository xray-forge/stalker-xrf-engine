/**
 * Enumeration of possible playable sounds types.
 */
export enum EPlayableSound {
  ACTOR = "actor",
  NPC = "npc",
  "3D" = "3d",
  LOOPED = "looped",
}

/**
 * Type of playback for playable sounds.
 * - Play random sound from playlist
 * - Play in loop whole playlist
 * - Play once in sequence
 */
export enum ESoundPlaylistType {
  RANDOM = "rnd",
  SEQUENCE = "seq",
  LOOP = "loop",
}
