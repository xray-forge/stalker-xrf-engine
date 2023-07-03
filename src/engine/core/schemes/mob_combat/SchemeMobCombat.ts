import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobCombatState } from "@/engine/core/schemes/mob_combat/ISchemeMobCombatState";
import { MobCombatManager } from "@/engine/core/schemes/mob_combat/MobCombatManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export class SchemeMobCombat extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_COMBAT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeMobCombatState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.enabled = true;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobCombatState
  ): void {
    const newAction: MobCombatManager = new MobCombatManager(object, state);

    state.action = newAction;

    SchemeMobCombat.subscribe(object, state, newAction);
  }

  public static override disable(object: ClientObject, scheme: EScheme): void {
    const state: Optional<ISchemeMobCombatState> = registry.objects.get(object.id())[scheme] as ISchemeMobCombatState;

    if (state !== null) {
      state.enabled = false;
    }
  }
}
