import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { Optional, ParticlesObject, SoundObject, TDuration, TName, TTimestamp } from "@/engine/lib/types";

/**
 * State describing particles scheme configuration.
 */
export interface ISchemeParticleState extends IBaseSchemeState {
  name: TName;
  path: TName;
  mode: EParticleBehaviour;
  looped: boolean;
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
 * todo: Clarify meaning.
 */
export enum EParticleBehaviour {
  FIRST = 1,
  SECOND = 2,
}
