import { XR_game_object, XR_ini_file } from "xray16";

import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeTeleportState, ITeleportPoint } from "@/engine/core/schemes/teleport/ISchemeTeleportState";
import { TeleportManager } from "@/engine/core/schemes/teleport/TeleportManager";
import { abort } from "@/engine/core/utils/debug";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { getConfigNumber, getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeTeleport extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TELEPORT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeTeleportState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
    state.timeout = getConfigNumber(ini, section, "timeout", object, false, 900);
    state.points = new LuaTable();

    for (const it of $range(1, 10)) {
      const teleportPoint: ITeleportPoint = {
        point: getConfigString(ini, section, "point" + tostring(it), object, false, "", "none"),
        look: getConfigString(ini, section, "look" + tostring(it), object, false, "", "none"),
        prob: getConfigNumber(ini, section, "prob" + tostring(it), object, false, 100),
      };

      if (teleportPoint.point === "none" || teleportPoint.look === "none") {
        break;
      }

      table.insert(state.points, teleportPoint);
    }

    if (state.points.length() === 0) {
      abort("Wrong point in teleport scheme: [%s].", tostring(section));
    }
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTeleportState
  ): void {
    SchemeTeleport.subscribe(object, state, new TeleportManager(object, state));
  }
}
