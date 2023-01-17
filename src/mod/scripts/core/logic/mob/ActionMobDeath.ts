import { XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("MobDeath");

export class ActionMobDeath extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION = "mob_death";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    const action = new ActionMobDeath(npc, storage);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    log.info("Set scheme:", npc.name(), scheme, section);

    const state = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);
  }

  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    let death = storage.get(victim.id()).death!;

    if (death === null) {
      death = {} as any;
      storage.get(victim.id()).death = death;
    }

    if (who !== null) {
      death.killer = who.id();
      death.killer_name = who.name();
    } else {
      death.killer = -1;
      death.killer_name = null;
    }

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(victim, this.state, getActor())) {
      return;
    }
  }
}
