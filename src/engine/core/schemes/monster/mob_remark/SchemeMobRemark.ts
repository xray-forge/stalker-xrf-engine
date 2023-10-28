import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { getMonsterState } from "@/engine/core/database";
import { ISchemeMobRemarkState } from "@/engine/core/schemes/monster/mob_remark/mob_remark_types";
import { MobRemarkManager } from "@/engine/core/schemes/monster/mob_remark/MobRemarkManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniConditionList, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMobRemark extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_REMARK;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeMobRemarkState {
    const state: ISchemeMobRemarkState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.state = getMonsterState(ini, section);
    state.dialogCondition = readIniConditionList(ini, section, "dialog_cond");
    state.noReset = true;
    state.anim = readIniString(ini, section, "anim", false);
    state.animationMovement = readIniBoolean(ini, section, "anim_movement", false, false);
    state.animationHead = readIniString(ini, section, "anim_head", false);
    state.tip = readIniString(ini, section, "tip", false);
    state.snd = readIniString(ini, section, "snd", false);
    state.time = readIniString(ini, section, "time", false);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobRemarkState
  ): void {
    AbstractScheme.subscribe(object, state, new MobRemarkManager(object, state));
  }
}
