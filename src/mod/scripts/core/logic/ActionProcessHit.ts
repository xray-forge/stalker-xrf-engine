import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import {
  assign_storage_and_bind,
  subscribe_action_for_events,
  try_switch_to_another_section,
  unsubscribe_action_from_events,
} from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionProcessHit");

export class ActionProcessHit extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "hit";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.id());
    storage.action = new ActionProcessHit(npc, storage);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    logger.info("Disable scheme:", npc.id());

    const st = storage.get(npc.id())[scheme];

    if (st !== null) {
      unsubscribe_action_from_events(npc, st, st.action);
    }
  }

  public static set_hit_checker(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    logger.info("Set hit checker:", npc.id());

    const st = assign_storage_and_bind(npc, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section [%s] for npc [%s]", section, npc.name());
    }

    st.logic = cfg_get_switch_conditions(ini, section, npc);

    subscribe_action_for_events(npc, st, st.action);
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    storage.get(this.object.id()).hit.bone_index = bone_index;

    if (amount === 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      logger.info("Object hit:", object.name(), "<-", who.name(), amount);

      storage.get(object.id()).hit.who = who.id();
    } else {
      logger.info("Object hit:", object.name(), "<-", "unknown", amount);
      storage.get(object.id()).hit.who = -1;
    }

    if (storage.get(this.object.id()).active_scheme) {
      storage.get(this.object.id()).hit.deadly_hit = amount >= this.object.health * 100;

      if (try_switch_to_another_section(object, storage.get(this.object.id()).hit, getActor())) {
        storage.get(this.object.id()).hit.deadly_hit = false;

        return;
      }

      storage.get(this.object.id()).hit.deadly_hit = false;
    }
  }
}
