import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/schemes/unsubscribeActionFromEvents";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeHit");

/**
 * todo;
 */
export class SchemeHit extends AbstractScheme {
  public static SCHEME_SECTION: EScheme = EScheme.HIT;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.id());
    storage.action = new SchemeHit(object, storage);
  }

  public static disable_scheme(object: XR_game_object, scheme: EScheme): void {
    logger.info("Disable scheme:", object.id());

    const st = registry.objects.get(object.id())[scheme];

    if (st !== null) {
      unsubscribeActionFromEvents(object, st, st.action);
    }
  }

  public static set_hit_checker(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set hit checker:", object.id());

    const st = assignStorageAndBind(object, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section [%s] for npc [%s]", section, object.name());
    }

    st.logic = cfg_get_switch_conditions(ini, section, object);

    subscribeActionForEvents(object, st, st.action);
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    registry.objects.get(this.object.id()).hit.bone_index = bone_index;

    if (amount === 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      logger.info("Object hit:", object.name(), "<-", who.name(), amount);

      registry.objects.get(object.id()).hit.who = who.id();
    } else {
      logger.info("Object hit:", object.name(), "<-", "unknown", amount);
      registry.objects.get(object.id()).hit.who = -1;
    }

    if (registry.objects.get(this.object.id()).active_scheme) {
      registry.objects.get(this.object.id()).hit.deadly_hit = amount >= this.object.health * 100;

      if (trySwitchToAnotherSection(object, registry.objects.get(this.object.id()).hit, registry.actor)) {
        registry.objects.get(this.object.id()).hit.deadly_hit = false;

        return;
      }

      registry.objects.get(this.object.id()).hit.deadly_hit = false;
    }
  }
}
