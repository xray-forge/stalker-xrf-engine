import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * Enumeration to define actor state relative to zone.
 */
export enum EActorZoneState {
  NOWHERE,
  INSIDE,
  OUTSIDE,
}

/**
 * State representing configuration of no weapon scheme.
 */
export interface ISchemeNoWeaponState extends IBaseSchemeState {}
