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
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionOnHit");

export class ActionOnHit extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "ph_on_hit";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());

    storage.action = new ActionOnHit(npc, storage);
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    logger.info("Set scheme:", npc.name());

    const st = assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, npc);
    subscribe_action_for_events(npc, st, st.action);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    const st = storage.get(npc.id())[scheme];

    if (st) {
      unsubscribe_action_from_events(npc, st, st.action);
    }
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    const who_name: string = who ? who.name() : "nil";

    logger.info("Object hit:", object.name(), "<-", who_name, amount);

    if (storage.get(this.object.id()).active_scheme) {
      if (try_switch_to_another_section(object, this.state, getActor())) {
        return;
      }
    }
  }
}
