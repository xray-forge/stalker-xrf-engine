import { cond, look, patrol, vector, XR_game_object, XR_ini_file, XR_patrol, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { action } from "@/mod/scripts/utils/alife";
import { getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const STATE_START_LOOK = 1;
const STATE_WAIT_LOOK_END = 2;
const STATE_JUMP = 3;

const logger: LuaLogger = new LuaLogger("MobJump");

export class ActionMobJump extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "mob_jump";

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name(), scheme, section);

    const new_action = new ActionMobJump(npc, storage);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", npc.name(), scheme, section);

    const storage = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme, section);

    storage.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    storage.jump_path_name = getConfigString(ini, section, "path_jump", npc, false, gulag_name);
    storage.ph_jump_factor = getConfigNumber(ini, section, "ph_jump_factor", npc, false, 1.8);

    const offset_str = getConfigString(ini, section, "offset", npc, true, "");
    const elems = parseNames(offset_str);

    storage.offset = new vector().set(tonumber(elems.get(1))!, tonumber(elems.get(2))!, tonumber(elems.get(3))!);

    if (!ini.line_exist(section, "on_signal")) {
      abort("Bad jump scheme usage! 'on_signal' line must be specified.");
    }
  }

  public jump_path: Optional<XR_patrol> = null;
  public point: Optional<XR_vector> = null;
  public state_current: Optional<number> = null;

  public reset_scheme(): void {
    get_global<AnyCallablesModule>("xr_logic").mob_capture(this.object, true);

    // -- reset signals
    this.state.signals = {};

    // -- initialize jump point
    this.jump_path = null;

    if (this.state.jump_path_name) {
      this.jump_path = new patrol(this.state.jump_path_name);
    } else {
      this.state.jump_path_name = "[not defined]";
    }

    if (!this.jump_path) {
      abort("object '%s': unable to find jump_path '%s' on the map", this.object.name(), this.state.jump_path_name);
    }

    this.point = new vector().add(this.jump_path.point(0), this.state.offset);

    this.state_current = STATE_START_LOOK;
  }

  public update(delta: number): void {
    if (this.state_current === STATE_START_LOOK) {
      if (!this.object.action()) {
        action(this.object, new look(look.point, this.point!), new cond(cond.look_end));

        this.state_current = STATE_WAIT_LOOK_END;
      }
    } else if (this.state_current === STATE_WAIT_LOOK_END) {
      if (!this.object.action()) {
        this.state_current = STATE_JUMP;
      }
    }

    if (this.state_current === STATE_JUMP) {
      this.object.jump(this.point!, this.state.ph_jump_factor);
      this.state.signals["jumped"] = true;
      get_global<AnyCallablesModule>("xr_logic").mob_release(this.object);
    }
  }
}
