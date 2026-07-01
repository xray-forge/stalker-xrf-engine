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
 * Enable or disable talking with the object based on its wounded state, relation to the actor and meet use flag.
 *
 * @param object - Game object whose talk availability is updated.
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
 * @param object - Game object the actor is interacting with.
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
    getObjectsRelationSafe(object, actor) === EGameObjectRelation.FRIEND
  ) {
    addObjectAbuse(object, 1);
  }
}

/**
 * Increment abuse for object.
 *
 * @param object - Game object.
 * @param value - Count of abuse to add.
 */
export function addObjectAbuse(object: GameObject, value: TCount): void {
  const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  abuseState?.abuseManager.addAbuse(value);
}

/**
 * Clear abuse state for object.
 *
 * @param object - Game object.
 */
export function clearObjectAbuse(object: GameObject): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  state?.abuseManager.clearAbuse();
}

/**
 * Set object abuse state.
 *
 * @param object - Game object.
 * @param isEnabled - Whether object abuse state should be enabled.
 */
export function setObjectAbuseState(object: GameObject, isEnabled: boolean): void {
  const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[EScheme.ABUSE] as ISchemeAbuseState;

  if (isEnabled) {
    state?.abuseManager.enableAbuse();
  } else {
    state?.abuseManager.disableAbuse();
  }
}
