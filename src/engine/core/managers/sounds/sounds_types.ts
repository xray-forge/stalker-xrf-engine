import { LuaArray, Optional, TDuration, TName, TPath } from "@/engine/lib/types";

/**
 * Dynamic theme playlist descriptor.
 */
export interface IDynamicMusicDescriptor {
  maps?: Optional<TName>;
  files: LuaArray<TName>;
}

/**
 * todo;
 */
export enum EDynamicMusicState {
  IDLE,
  START,
  FINISH,
}

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

/**
 * todo;
 */
export enum ESoundStoryParticipant {
  TELLER = "teller",
  REACTION = "reaction",
  REACTION_ALL = "reaction_all",
}

/**
 * todo: Description.
 */
export interface IReplicDescriptor {
  who: TName;
  theme: TPath;
  timeout: TDuration;
}
