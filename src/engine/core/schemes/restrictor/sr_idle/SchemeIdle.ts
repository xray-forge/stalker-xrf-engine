import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { IdleManager } from "@/engine/core/schemes/restrictor/sr_idle/IdleManager";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { GameObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * Action scheme to block NPCs from any action until some conditions are met.
 * Example: objects wait for game intro to stop before doing something.
 */
export class SchemeIdle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_IDLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeIdleState {
    const state: ISchemeIdleState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeIdleState
  ): void {
    AbstractScheme.subscribe(state, new IdleManager(object, state));
  }
}
