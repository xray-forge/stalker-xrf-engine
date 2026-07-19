import { GameObject, IniFile } from "xray16/alias";
import { assert, createVector, LuaArray, TName, TSection } from "xray16/lib";

import { getConfigSwitchConditions, parseStringsList, readIniNumber, readIniString } from "@/engine/core/ini";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobJumpState } from "@/engine/core/schemes/monster/mob_jump/mob_jump_types";
import { MobJumpManager } from "@/engine/core/schemes/monster/mob_jump/MobJumpManager";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

/**
 * Scheme to force monsters jumping.
 */
export class SchemeMobJump extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_JUMP;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeMobJumpState {
    assert(ini.line_exist(section, "on_signal"), "Bad jump scheme usage! 'on_signal' line must be specified.");

    const state: ISchemeMobJumpState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.jumpPathName = readIniString(ini, section, "path_jump", false, smartTerrainName);
    state.phJumpFactor = readIniNumber(ini, section, "ph_jump_factor", false, 1.8);

    const offsets: LuaArray<string> = parseStringsList(readIniString(ini, section, "offset", true));

    state.offset = createVector(tonumber(offsets.get(1))!, tonumber(offsets.get(2))!, tonumber(offsets.get(3))!);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobJumpState
  ): void {
    SchemeMobJump.subscribe(state, new MobJumpManager(object, state));
  }
}
