import { expect } from "@jest/globals";
import type { AnyObject, IConstructor } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";

/**
 * Check if scheme manager is subscribed in scheme base state.
 *
 * @param state - Base state to check.
 * @param action - Action class to verify subscription for.
 */
export function assertSchemeSubscribedToManager(state: IBaseSchemeState, action: IConstructor<AnyObject>): void {
  for (const [subscriber] of state.actions as LuaTable<AnyObject, boolean>) {
    if (subscriber instanceof action) {
      return;
    }
  }

  throw new Error(`Expected '${action.name}' to be subscribed to '${state.scheme}' scheme state.`);
}

/**
 * Check if scheme manager is not subscribed to actions.
 *
 * @param state - Base state to check.
 */
export function assertSchemeNotToBeSubscribed(state: IBaseSchemeState): void {
  if (state.actions) {
    expect(state.actions?.length()).toBe(0);
  }
}
