import { LuaArray, Nillable, TDuration, TName, TPath } from "@/engine/lib/types";

/**
 * Dynamic theme playlist descriptor.
 */
export interface IDynamicMusicDescriptor {
  maps?: Nillable<TName>;
  files: LuaArray<TName>;
}

/**
 * Enumeration of dynamic music playback states.
 */
export const enum EDynamicMusicState {
  IDLE,
  START,
  FINISH,
}

/**
 * Enumeration of possible playable sounds types.
 */
export const enum EPlayableSound {
  ACTOR = "actor",
  NPC = "npc",
  "3D" = "3d",
  LOOPED = "looped",
}

/**
 * Type of playback for playable sounds.
 * - Play random sound from playlist
 * - Play in loop whole playlist
 * - Play once in sequence.
 */
export const enum ESoundPlaylistType {
  RANDOM = "rnd",
  SEQUENCE = "seq",
  LOOP = "loop",
}

/**
 * Enumeration of participant roles in a sound story.
 */
export const enum ESoundStoryParticipant {
  TELLER = "teller",
  REACTION = "reaction",
  REACTION_ALL = "reaction_all",
}

/**
 * Descriptor of a single replica (phrase) in a sound story.
 */
export interface IReplicDescriptor {
  who: TName;
  theme: TPath;
  timeout: TDuration;
}
