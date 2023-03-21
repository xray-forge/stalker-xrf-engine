import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemePhysicalHitState } from "@/engine/core/schemes/ph_hit/ISchemePhysicalHitState";
import { PhysicalHitManager } from "@/engine/core/schemes/ph_hit/PhysicalHitManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemePhysicalHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemePhysicalHitState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.power = getConfigNumber(ini, section, "power", object, false, 0);
    state.impulse = getConfigNumber(ini, section, "impulse", object, false, 1000);
    state.bone = getConfigString(ini, section, "bone", object, true, "");
    state.dir_path = getConfigString(ini, section, "dir_path", object, true, "");
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalHitState
  ): void {
    SchemePhysicalHit.subscribe(object, state, new PhysicalHitManager(object, state));
  }
}
