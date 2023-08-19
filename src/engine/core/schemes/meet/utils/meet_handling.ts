import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectHelpingWounded, isObjectSearchingCorpse, isObjectWounded } from "@/engine/core/utils/object";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { ClientObject, EClientObjectRelation, EScheme, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description.
 */
export function updateObjectInteractionAvailability(object: ClientObject): void {
  if (isObjectWounded(object.id())) {
    if (object.relation(registry.actor) === EClientObjectRelation.ENEMY) {
      object.disable_talk();
    } else {
      const state: Optional<ISchemeWoundedState> = registry.objects.get(object.id())[
        EScheme.WOUNDED
      ] as ISchemeWoundedState;

      if (state.enable_talk) {
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
 * todo: Description.
 */
export function activateMeetWithObject(object: ClientObject): void {
  if (!object.alive()) {
    return;
  }

  const state: Optional<ISchemeMeetState> = registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState;

  if (state === null) {
    return;
  }

  logger.info("Activate meet interaction:", object.name());

  const actor: ClientObject = registry.actor;
  const sound: Optional<TName> = pickSectionFromCondList(actor, object, state.snd_on_use);

  if (tostring(sound) !== NIL) {
    GlobalSoundManager.getInstance().playSound(object.id(), sound, null, null);
  }

  const meetManager: MeetManager = state.meetManager;

  if (
    meetManager.use === FALSE &&
    meetManager.abuseMode === TRUE &&
    getObjectsRelationSafe(object, actor) !== EClientObjectRelation.ENEMY
  ) {
    SchemeAbuse.addAbuse(object, 1);
  }
}
