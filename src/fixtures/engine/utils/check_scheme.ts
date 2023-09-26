import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import type { AnyObject } from "@/engine/lib/types";

/**
 * Check if scheme manager is subscribed in scheme base state.
 *
 * @param state - base state to check
 * @param action - action class to verify subscription for
 */
export function assertSchemeSubscribedToManager(
  state: IBaseSchemeState,
  action: typeof AbstractSchemeManager<IBaseSchemeState>
): void {
  for (const [subscriber] of state.actions as LuaTable<AnyObject, boolean>) {
    if (subscriber instanceof action) {
      return;
    }
  }

  throw new Error(`Expected '${action.name}' to be subscribed to '${state.scheme}' scheme state.`);
}
