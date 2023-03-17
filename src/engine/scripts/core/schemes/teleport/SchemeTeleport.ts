import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { ISchemeTeleportState, ITeleportPoint } from "@/engine/scripts/core/schemes/teleport/ISchemeTeleportState";
import { TeleportManager } from "@/engine/scripts/core/schemes/teleport/TeleportManager";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeTeleport extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TELEPORT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTeleportState
  ): void {
    subscribeActionForEvents(object, state, new TeleportManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeTeleportState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

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
}
