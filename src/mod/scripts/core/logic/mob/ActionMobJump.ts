import { cond, look, patrol, vector, XR_game_object, XR_ini_file, XR_patrol, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { mob_capture } from "@/mod/scripts/core/schemes/mob_capture";
import { mob_release } from "@/mod/scripts/core/schemes/mob_release";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { action } from "@/mod/scripts/utils/alife";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const STATE_START_LOOK = 1;
const STATE_WAIT_LOOK_END = 2;
const STATE_JUMP = 3;

const logger: LuaLogger = new LuaLogger("MobJump");

export class ActionMobJump extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.MOB_JUMP;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name(), scheme, section);

    subscribeActionForEvents(object, storage, new ActionMobJump(object, storage));
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const storage = assignStorageAndBind(object, ini, scheme, section);

    storage.logic = cfg_get_switch_conditions(ini, section, object);
    storage.jump_path_name = getConfigString(ini, section, "path_jump", object, false, gulag_name);
    storage.ph_jump_factor = getConfigNumber(ini, section, "ph_jump_factor", object, false, 1.8);

    const offset_str = getConfigString(ini, section, "offset", object, true, "");
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
    mob_capture(this.object, true);

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
      mob_release(this.object);
    }
  }
}
