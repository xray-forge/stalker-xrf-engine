import { registry } from "@/engine/core/database";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { ClientObject, EScheme, Optional, TCount } from "@/engine/lib/types";

/**
 * Increment abuse for object.
 *
 * @param object - target client object
 * @param value - count of abuse to add
 */
export function addObjectAbuse(object: ClientObject, value: TCount): void {
  const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  abuseState?.abuseManager.addAbuse(value);
}

/**
 * Clear abuse state for object.
 *
 * @param object - target client object
 */
export function clearObjectAbuse(object: ClientObject): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  state?.abuseManager.clearAbuse();
}

/**
 * Set object abuse state.
 *
 * @param object - target client object
 * @param isEnabled - whether object abuse state should be enabled
 */
export function setObjectAbuseState(object: ClientObject, isEnabled: boolean): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  if (isEnabled) {
    state?.abuseManager.enableAbuse();
  } else {
    state?.abuseManager.disableAbuse();
  }
}
