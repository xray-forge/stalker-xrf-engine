import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { ISchemePhysicalOnDeathState } from "@/engine/core/schemes/physical/ph_on_death/ph_on_death_types";
import { PhysicalDeathManager } from "@/engine/core/schemes/physical/ph_on_death/PhysicalDeathManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { GameObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * Scheme to handle death event for physical objects as part of scripts/game events.
 */
export class SchemePhysicalOnDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalOnDeathState {
    const state: ISchemePhysicalOnDeathState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    storage: ISchemePhysicalOnDeathState
  ): void {
    const action: PhysicalDeathManager = new PhysicalDeathManager(object, storage);

    storage.action = action;

    AbstractScheme.subscribe(storage, action);
  }

  public static override disable(object: GameObject, scheme: EScheme): void {
    // todo: unsubscribe from actions? Was not issue because death happens only once
    // ---  object:set_callback(callback.death, nil)
  }
}
