import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { AnyObject, IConstructor } from "@/engine/lib/types";

/**
 * Check if scheme manager is subscribed in scheme base state.
 *
 * @param state - base state to check
 * @param action - action class to verify subscription for
 */
export function assertSchemeSubscribedToManager(state: IBaseSchemeState, action: IConstructor<AnyObject>): void {
  for (const [subscriber] of state.actions as LuaTable<AnyObject, boolean>) {
    if (subscriber instanceof action) {
      return;
    }
  }

  throw new Error(`Expected '${action.name}' to be subscribed to '${state.scheme}' scheme state.`);
}
