import { XR_game_object, XR_ini_file } from "xray16";

import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import {
  assign_storage_and_bind,
  subscribe_action_for_events,
  try_switch_to_another_section,
} from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("MobCombat");

export class ActionMobCombat extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "mob_combat";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const new_action: ActionMobCombat = new ActionMobCombat(object, storage);

    storage.action = new_action;

    subscribe_action_for_events(object, storage, new_action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name?: string
  ): void {
    logger.info("Set scheme:", npc?.name(), scheme, section);

    const state = assign_storage_and_bind(npc, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, npc);
    state.enabled = true;
  }

  public static disable_scheme(this: void, npc: XR_game_object, scheme: string): void {
    const st = storage.get(npc.id())[scheme];

    if (st !== null) {
      st.enabled = false;
    }
  }

  // todo: Is it needed at all?
  public combat_callback(): void {
    if (this.state.enabled && this.object.get_enemy() !== null) {
      if (storage.get(this.object.id()).active_scheme !== null) {
        if (try_switch_to_another_section(this.object, this.state, getActor())) {
          return;
        }
      }
    }
  }
}
