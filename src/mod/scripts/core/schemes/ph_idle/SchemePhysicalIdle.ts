import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  parse_data_1v,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalIdle");

/**
 * todo;
 */
export class SchemePhysicalIdle extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_IDLE;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, state, new SchemePhysicalIdle(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.hit_on_bone = parse_data_1v(object, getConfigString(ini, section, "hit_on_bone", object, false, ""));
    state.nonscript_usable = getConfigBoolean(ini, section, "nonscript_usable", object, false);
    state.on_use = getConfigCondList(ini, section, "on_use", object);

    state.tips = getConfigString(ini, section, "tips", object, false, "", "");

    object.set_tip_text(state.tips);
  }

  public reset_scheme(): void {
    this.object.set_nonscript_usable(this.state.nonscript_usable);
  }

  public update(delta: number): void {
    trySwitchToAnotherSection(this.object, this.state, getActor());
  }

  public deactivate(): void {
    this.object.set_tip_text("");
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    const_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    logger.info("Idle hit:", this.object.name());

    if (this.state.hit_on_bone[bone_index] !== null) {
      const section: TSection = pickSectionFromCondList(
        getActor() as XR_game_object,
        this.object,
        this.state.hit_on_bone[bone_index].state
      )!;

      switchToSection(object, this.state.ini!, section);
    }
  }

  public use_callback(): Optional<boolean> {
    logger.info("Idle use:", this.object.name());

    if (this.state.on_use) {
      if (
        switchToSection(
          this.object,
          this.state.ini!,
          pickSectionFromCondList(getActor() as XR_game_object, this.object, this.state.on_use.condlist)!
        )
      ) {
        return true;
      }
    }

    return null;
  }
}
