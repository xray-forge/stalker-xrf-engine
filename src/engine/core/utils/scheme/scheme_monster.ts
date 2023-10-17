import { entity_action } from "xray16";

import { alifeConfig } from "@/engine/lib/configs/AlifeConfig";
import { EntityAction, GameObject, TEntityActionType, TName } from "@/engine/lib/types";

/**
 * Check whether monster is currently captured by script logic.
 *
 * @param object - target client monster object
 * @returns whether monster currently has active script
 */
export function isMonsterScriptCaptured(object: GameObject): boolean {
  return object.get_script();
}

/**
 * todo;
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
 * @param object - target client monster object
 * @param resetActions - whether action should be reset or captured
 * @param scriptName - script name to capture object, using shared name for XRF logics by default
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
 * @param object - target client object
 */
export function scriptReleaseMonster(object: GameObject): void {
  if (object.get_script()) {
    object.script(false, object.get_script_name());
  }
}

/**
 * Command object to do some actions.
 *
 * @param object - target object to command
 * @param actions - list of actions to perform
 */
export function scriptCommandMonster(object: GameObject, ...actions: Array<TEntityActionType>): void {
  const entityAction: EntityAction = new entity_action();

  for (const type of actions) {
    entityAction.set_action(type);
  }

  object.command(entityAction, false);
}
