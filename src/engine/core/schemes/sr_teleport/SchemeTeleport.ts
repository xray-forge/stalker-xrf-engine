import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeTeleportState, ITeleportPoint } from "@/engine/core/schemes/sr_teleport/ISchemeTeleportState";
import { TeleportManager } from "@/engine/core/schemes/sr_teleport/TeleportManager";
import { assert } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme logic implementation for restrictors teleportation.
 * Allows teleporting on reaching specific location.
 */
export class SchemeTeleport extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TELEPORT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeTeleportState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.timeout = readIniNumber(ini, section, "timeout", false, 900);
    state.points = new LuaTable();
    state.maxTotalProbability = 0;

    for (const it of $range(1, 10)) {
      const teleportPoint: ITeleportPoint = {
        point: readIniString(ini, section, "point" + tostring(it), false, "", "none"),
        look: readIniString(ini, section, "look" + tostring(it), false, "", "none"),
        probability: readIniNumber(ini, section, "prob" + tostring(it), false, 100),
      };

      if (teleportPoint.point === "none" || teleportPoint.look === "none") {
        break;
      }

      table.insert(state.points, teleportPoint);

      state.maxTotalProbability += teleportPoint.probability;
    }

    assert(state.points.length() > 0, "Wrong point in teleport scheme: [%s].", tostring(section));
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTeleportState
  ): void {
    SchemeTeleport.subscribe(object, state, new TeleportManager(object, state));
  }
}