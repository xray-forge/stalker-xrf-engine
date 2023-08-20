import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { ClientObject, Maybe, Optional } from "@/engine/lib/types";

/**
 * Allow wounded object to heal.
 *
 * todo;
 */
export function enableObjectWoundedHealing(object: ClientObject): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
}

/**
 * todo: Description.
 */
export function isObjectPsyWounded(object: ClientObject): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.wounded !== null) {
    const woundState: Optional<string> = (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager
      .woundState as Optional<string>;

    return (
      woundState === "psy_pain" ||
      woundState === "psy_armed" ||
      woundState === "psy_shoot" ||
      woundState === "psycho_pain" ||
      woundState === "psycho_shoot"
    );
  }

  return false;
}
