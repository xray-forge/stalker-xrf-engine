import { GameObject, IniFile } from "xray16/alias";
import { TSection } from "xray16/lib";

import { AbstractScheme } from "@/engine/core/schemes/base";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";

/**
 * Scheme defining logics of how to handle monster death and record information about who killed them.
 */
export class SchemeMobDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeMobDeathState {
    const state: ISchemeMobDeathState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMobDeathState
  ): void {
    AbstractScheme.subscribe(state, new MobDeathManager(object, state));
  }
}
