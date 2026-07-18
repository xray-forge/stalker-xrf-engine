import { Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import {
  IBaseSchemeState,
  IRegistryObjectState,
  ISchemeStateMap,
  TStatefulScheme,
} from "@/engine/core/database/database_types";
import { EScheme } from "@/engine/lib/types";

/**
 * Check whether a registered scheme state exists.
 *
 * This is a direct indexed presence check with no validation or allocation and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @param scheme - Registered scheme key.
 * @returns Whether the scheme state exists.
 */
export function hasSchemeState<S extends TStatefulScheme>(state: IRegistryObjectState, scheme: S): boolean {
  return $isNotNil(state[scheme]);
}

/**
 * Store a concrete state for a registered scheme.
 *
 * This is a type-only boundary: it performs one indexed assignment and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @param scheme - Registered scheme key.
 * @param schemeState - State for the scheme.
 */
export function setSchemeState<S extends TStatefulScheme>(
  state: IRegistryObjectState,
  scheme: S,
  schemeState: ISchemeStateMap[S]
): void {
  state[scheme] = schemeState;
}

/**
 * Get an optional registered scheme state.
 *
 * This is a type-only lookup: it performs no validation, allocation, logging, or assertion and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @param scheme - Registered scheme key.
 * @returns Scheme state, if present.
 */
export function getSchemeState<S extends TStatefulScheme>(
  state: IRegistryObjectState,
  scheme: S
): Nillable<ISchemeStateMap[S]> {
  return state[scheme] as Nillable<ISchemeStateMap[S]>;
}

/**
 * Get a registered scheme state known to exist.
 *
 * This intentionally performs no runtime assertion and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @param scheme - Registered scheme key.
 * @returns Scheme state.
 */
export function getSchemeStateOptimistic<S extends TStatefulScheme>(
  state: IRegistryObjectState,
  scheme: S
): ISchemeStateMap[S] {
  return state[scheme] as ISchemeStateMap[S];
}

/**
 * Check whether an object has an active scheme key.
 *
 * This checks only the active-scheme key and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @returns Whether an active scheme key exists.
 */
export function hasActiveScheme(state: IRegistryObjectState): boolean {
  return $isNotNil(state.activeScheme);
}

/**
 * Get an optional active scheme state.
 *
 * This performs no validation and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @returns Active scheme state, if present.
 */
export function getActiveSchemeState<T extends IBaseSchemeState = IBaseSchemeState>(
  state: IRegistryObjectState
): Nillable<T> {
  return state.activeScheme ? (state[state.activeScheme] as Nillable<T>) : null;
}

/**
 * Get an active scheme state known to exist.
 *
 * This intentionally performs no runtime assertion and is safe to inline into Lua.
 *
 * @inline
 *
 * @param state - Object registry state.
 * @returns Active scheme state.
 */
export function getActiveSchemeStateOptimistic<T extends IBaseSchemeState>(state: IRegistryObjectState): T {
  return state[state.activeScheme as EScheme] as T;
}
