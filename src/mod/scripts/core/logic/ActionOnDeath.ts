import { XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionOnDeath");

export class ActionOnDeath {
  public static readonly SCHEME_SECTION: string = "ph_on_death";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    log.info("Add to binder:", npc.name());

    const action: ActionOnDeath = new ActionOnDeath(npc, storage);

    storage.action = action;

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, action);
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    log.info("Set scheme:", npc.name());

    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    // ---  npc:set_callback(callback.death, nil)
  }

  public object: XR_game_object;
  public st: IStoredObject;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    this.object = object;
    this.st = storage;
  }

  public reset_scheme(): void {}

  public update(delta: number): void {}

  public death_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    if (storage.get(this.object.id()).active_scheme) {
      if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(object, this.st, getActor())) {
        return;
      }
    }
  }
}
