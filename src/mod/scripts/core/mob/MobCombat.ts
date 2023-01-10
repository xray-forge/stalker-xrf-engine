import { XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("MobCombat");

export class MobCombat {
  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    const new_action = new MobCombat(npc, storage);

    storage.action = new_action;

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    log.info("Set scheme:", npc.name(), scheme, section);

    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);
    st.enabled = true;
  }

  public static disable_scheme(this: void, npc: XR_game_object, scheme: string): void {
    const st = storage.get(npc.id())[scheme];

    if (st !== null) {
      st.enabled = false;
    }
  }

  public object: XR_game_object;
  public st: IStoredObject;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    this.object = object;
    this.st = storage;
  }

  // todo: Is it needed at all?
  public combat_callback(): void {
    if (this.st.enabled && this.object.get_enemy() !== null) {
      if (storage.get(this.object.id()).active_scheme !== null) {
        if (
          get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.st, getActor())
        ) {
          return;
        }
      }
    }
  }
}
