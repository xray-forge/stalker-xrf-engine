import { entity_action } from "xray16";
import { EntityAction, GameObject, TEntityActionType } from "xray16/alias";

import { alifeConfig } from "@/engine/core/managers/simulation/AlifeConfig";
import { TName } from "@/engine/lib/types";

/**
 * Check whether monster is currently captured by script logic.
 *
 * @param object - Target client monster object.
 * @returns Whether monster currently has active script.
 */
export function isMonsterScriptCaptured(object: GameObject): boolean {
  return object.get_script();
}

/**
 * Reset monster active scripted actions.
 *
 * @param object - Game object to reset state for.
 * @param scriptName - Name of the script active after reset.
 */
export function resetMonsterAction(object: GameObject, scriptName: TName): void {
  if (object.get_script()) {
    object.script(false, object.get_script_name());
  }

  object.script(true, scriptName);
}

/**
 * Capture monster with script logic.
 * Blocks default monster behaviour and fully rely on schemes logic.
 *
 * @param object - Target client monster object.
 * @param resetActions - Whether action should be reset or captured.
 * @param scriptName - Script name to capture object, using shared name for XRF logics by default.
 */
export function scriptCaptureMonster(
  object: GameObject,
  resetActions: boolean,
  scriptName: TName = alifeConfig.OBJECT_CAPTURE_SCRIPT_NAME
): void {
  if (resetActions) {
    resetMonsterAction(object, scriptName);
  } else if (!object.get_script()) {
    object.script(true, scriptName);
  }
}

/**
 * Reset monster script control.
 * After reset monster will behave like generic game monster.
 *
 * @param object - Game object.
 */
export function scriptReleaseMonster(object: GameObject): void {
  if (object.get_script()) {
    object.script(false, object.get_script_name());
  }
}

/**
 * Command object to do some actions.
 *
 * @param object - Target object to command.
 * @param actions - List of actions to perform.
 */
export function scriptCommandMonster(object: GameObject, ...actions: Array<TEntityActionType>): void {
  const entityAction: EntityAction = new entity_action();

  for (const type of actions) {
    entityAction.set_action(type);
  }

  object.command(entityAction, false);
}
