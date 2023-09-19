import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { ISchemeMonsterState } from "@/engine/core/schemes/restrictor/sr_monster/ISchemeMonsterState";
import { MonsterManager } from "@/engine/core/schemes/restrictor/sr_monster/MonsterManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing monsters hiding somewhere.
 * When actor enters zone, play some sounds and then force monster to attack.
 */
export class SchemeMonster extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_MONSTER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * Activate scheme and apply configuration.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeMonsterState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.snd_obj = readIniString(ini, section, "snd", false);
    state.delay = readIniNumber(ini, section, "delay", false, 0);
    state.idle = readIniNumber(ini, section, "idle", false, 30) * 10000;

    state.path_table = parseStringsList(readIniString(ini, section, "sound_path", false)!);
    state.monster = readIniString(ini, section, "monster_section", false);
    state.sound_slide_vel = readIniNumber(ini, section, "slide_velocity", false, 7);
  }

  /**
   * Add scheme handlers and subscribe them to events.
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
