import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import {
  getConfigBoolean,
  getConfigCondList,
  getConfigString,
  getConfigSwitchConditions,
  pickSectionFromCondList,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseData1v } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("SchemePhysicalIdle");

/**
 * todo;
 */
export class SchemePhysicalIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, state, new SchemePhysicalIdle(object, state));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.hit_on_bone = parseData1v(object, getConfigString(ini, section, "hit_on_bone", object, false, ""));
    state.nonscript_usable = getConfigBoolean(ini, section, "nonscript_usable", object, false);
    state.on_use = getConfigCondList(ini, section, "on_use", object);

    state.tips = getConfigString(ini, section, "tips", object, false, "", "");

    object.set_tip_text(state.tips);
  }

  public override resetScheme(): void {
    this.object.set_nonscript_usable(this.state.nonscript_usable);
  }

  public override update(delta: number): void {
    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  public override deactivate(): void {
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
        registry.actor,
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
          pickSectionFromCondList(registry.actor, this.object, this.state.on_use.condlist)!
        )
      ) {
        return true;
      }
    }

    return null;
  }
}
