import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Optional, ParticlesObject, SoundObject, TDuration, TName, TTimestamp } from "@/engine/lib/types";

/**
 * State describing particles scheme configuration.
 */
export interface ISchemeParticleState extends IBaseSchemeState {
  name: TName;
  path: TName;
  mode: EParticleBehaviour;
  looped: boolean; // Whether particles should start if previous playback ended.
}

/**
 * Descriptor of stored particle object.
 */
export interface IParticleDescriptor {
  particle: ParticlesObject;
  sound: Optional<SoundObject>;
  delay: TDuration;
  time: TTimestamp;
  played: boolean;
}

/**
 * Mode of particle behaviour.
 */
export enum EParticleBehaviour {
  SIMPLE = 1, // Single particle based on path.
  COMPLEX = 2, // Scenario based particles, multiple particles on different positions.
}
