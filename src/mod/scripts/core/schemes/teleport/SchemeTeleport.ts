import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { ISchemeTeleportState, ITeleportPoint } from "@/mod/scripts/core/schemes/teleport/ISchemeTeleportState";
import { TeleportManager } from "@/mod/scripts/core/schemes/teleport/TeleportManager";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeTeleport");

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
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, state, new TeleportManager(object, state));
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", object.name());

    const state: ISchemeTeleportState = assignStorageAndBind(object, ini, scheme, section);

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
