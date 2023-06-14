import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeMonsterState } from "@/engine/core/schemes/sr_monster/ISchemeMonsterState";
import { MonsterManager } from "@/engine/core/schemes/sr_monster/MonsterManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { parseStringsList } from "@/engine/core/utils/ini/parse";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMonster extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_MONSTER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeMonsterState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.snd_obj = readIniString(ini, section, "snd", false, "", null);
    state.delay = readIniNumber(ini, section, "delay", false, 0);
    state.idle = readIniNumber(ini, section, "idle", false, 30) * 10000;

    const path: string = readIniString(ini, section, "sound_path", false, "", null)!;

    state.path_table = parseStringsList(path);
    state.monster = readIniString(ini, section, "monster_section", false, "", null);
    state.sound_slide_vel = readIniNumber(ini, section, "slide_velocity", false, 7);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMonsterState
  ): void {
    SchemeMonster.subscribe(object, state, new MonsterManager(object, state));
  }
}
