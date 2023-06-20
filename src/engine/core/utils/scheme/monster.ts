import { resetMonsterAction } from "@/engine/core/utils/object/object_general";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { ClientObject, TName } from "@/engine/lib/types";

/**
 * Check whether monster is currently captured by script logic.
 *
 * @param object - target client monster object
 * @returns whether monster currently has active script
 */
export function isMonsterScriptCaptured(object: ClientObject): boolean {
  return object.get_script();
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
  object: ClientObject,
  resetActions: boolean,
  scriptName: TName = logicsConfig.MONSTER_CAPTURE_SCRIPT_NAME
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
export function scriptReleaseMonster(object: ClientObject): void {
  if (object.get_script()) {
    object.script(false, object.get_script_name());
  }
}
