import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { ETimerType, ISchemeTimerState } from "@/engine/core/schemes/restrictor/sr_timer/sr_timer_types";
import { TimerManager } from "@/engine/core/schemes/restrictor/sr_timer/TimerManager";
import { assert } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniNumber, readIniNumberAndConditionList, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing timed logic with custom UI element telling about limits.
 */
export class SchemeTimer extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_TIMER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeTimerState {
    logger.info("Activate scheme:", object.name());

    const state: ISchemeTimerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.type = readIniString<ETimerType>(ini, section, "type", false, null, ETimerType.INCREMENT) as ETimerType;

    assert(
      state.type === ETimerType.INCREMENT || state.type === ETimerType.DECREMENT,
      "ERROR: wrong sr_timer type. Section [%s], Restrictor [%s]",
      section,
      object.name()
    );

    if (state.type === ETimerType.DECREMENT) {
      state.startValue = readIniNumber(ini, section, "start_value", true);
    } else {
      state.startValue = readIniNumber(ini, section, "start_value", false, 0);
    }

    state.onValue = readIniNumberAndConditionList(ini, section, "on_value");
    state.timerId = readIniString(ini, section, "timer_id", false, null, "hud_timer");
    state.string = readIniString(ini, section, "string", false);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeTimerState
  ): void {
    SchemeTimer.subscribe(object, state, new TimerManager(object, state));
  }
}
