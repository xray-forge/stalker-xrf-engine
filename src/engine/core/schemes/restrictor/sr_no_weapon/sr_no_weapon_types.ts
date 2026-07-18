import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/lib/types";

/**
 * Enumeration to define actor state relative to zone.
 */
export const enum EActorZoneState {
  NOWHERE,
  INSIDE,
  OUTSIDE,
}

/**
 * State representing configuration of no weapon scheme.
 */
export interface ISchemeNoWeaponState extends IBaseSchemeState {}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.SR_NO_WEAPON]: ISchemeNoWeaponState;
  }
}
