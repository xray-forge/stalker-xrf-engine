import { getManager, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectHelpingWounded, isObjectSearchingCorpse, isObjectWounded } from "@/engine/core/utils/planner";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { EGameObjectRelation, EScheme, GameObject, Optional, TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "meet" });

/**
 * todo: Description.
 */
export function updateObjectMeetAvailability(object: GameObject): void {
  if (isObjectWounded(object.id())) {
    if (object.relation(registry.actor) === EGameObjectRelation.ENEMY) {
      object.disable_talk();
    } else {
      const state: Optional<ISchemeWoundedState> = registry.objects.get(object.id())[
        EScheme.WOUNDED
      ] as ISchemeWoundedState;

      if (state.isTalkEnabled) {
        object.enable_talk();
      } else {
        object.disable_talk();
      }
    }

    return;
  }

  const state: ISchemeMeetState = registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState;
  const use: Optional<string> = state.meetManager.use;

  if (use === TRUE) {
    if (isObjectSearchingCorpse(object) || isObjectHelpingWounded(object)) {
      object.disable_talk();
    } else {
      object.enable_talk();
    }
  } else if (use === FALSE) {
    object.disable_talk();

    if (object.is_talking()) {
      object.stop_talk();
    }
  }
}

/**
 * Handle meet interaction with object.
 *
 * todo: Description.
 */
export function activateMeetWithObject(object: GameObject): void {
  if (!object.alive()) {
    return;
  }

  const state: Optional<ISchemeMeetState> = registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState;

  if (state === null) {
    return;
  }

  logger.info("Activate meet interaction: '%s'", object.name());

  const actor: GameObject = registry.actor;
  const sound: Optional<TName> = pickSectionFromCondList(actor, object, state.useSound);

  if (tostring(sound) !== NIL) {
    logger.info("Play meet sound: '%s' - '%s'", object.name(), sound);
    getManager(SoundManager).play(object.id(), sound);
  }

  const meetManager: MeetManager = state.meetManager;

  if (
    meetManager.use === FALSE &&
    meetManager.isAbuseModeEnabled === TRUE &&
    getObjectsRelationSafe(object, actor) !== EGameObjectRelation.ENEMY
  ) {
    addObjectAbuse(object, 1);
  }
}

/**
 * Increment abuse for object.
 *
 * @param object - game object
 * @param value - count of abuse to add
 */
export function addObjectAbuse(object: GameObject, value: TCount): void {
  const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  abuseState?.abuseManager.addAbuse(value);
}

/**
 * Clear abuse state for object.
 *
 * @param object - game object
 */
export function clearObjectAbuse(object: GameObject): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  state?.abuseManager.clearAbuse();
}

/**
 * Set object abuse state.
 *
 * @param object - game object
 * @param isEnabled - whether object abuse state should be enabled
 */
export function setObjectAbuseState(object: GameObject, isEnabled: boolean): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  if (isEnabled) {
    state?.abuseManager.enableAbuse();
  } else {
    state?.abuseManager.disableAbuse();
  }
}
