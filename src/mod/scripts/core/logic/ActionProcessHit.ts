import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionProcessHit");

export class ActionProcessHit extends AbstractSchemeAction {
  public static SCHEME_SECTION: string = "hit";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    log.info("Add to binder:", npc.id());
    storage.action = new ActionProcessHit(npc, storage);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    log.info("Disable scheme:", npc.id());

    const st = storage.get(npc.id())[scheme];

    if (st !== null) {
      get_global<AnyCallablesModule>("xr_logic").unsubscribe_action_from_events(npc, st, st.action);
    }
  }

  public static set_hit_checker(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    log.info("Set hit checker:", npc.id());

    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section [%s] for npc [%s]", section, npc.name());
    }

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, st, st.action);
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    storage.get(this.object.id()).hit.bone_index = bone_index;

    if (amount == 0 && !object.invulnerable()) {
      return;
    }

    if (who) {
      log.info("Object hit:", object.name(), "<-", who.name(), amount);

      storage.get(object.id()).hit.who = who.id();
    } else {
      log.info("Object hit:", object.name(), "<-", "unknown", amount);
      storage.get(object.id()).hit.who = -1;
    }

    if (storage.get(this.object.id()).active_scheme) {
      storage.get(this.object.id()).hit.deadly_hit = amount >= this.object.health * 100;

      if (
        get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(
          object,
          storage.get(this.object.id()).hit,
          getActor()
        )
      ) {
        storage.get(this.object.id()).hit.deadly_hit = false;

        return;
      }

      storage.get(this.object.id()).hit.deadly_hit = false;
    }
  }
}
