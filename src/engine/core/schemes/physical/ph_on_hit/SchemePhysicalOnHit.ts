import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { registry } from "@/engine/core/database";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/physical/ph_on_hit/ph_on_hit_types";
import { PhysicalOnHitManager } from "@/engine/core/schemes/physical/ph_on_hit/PhysicalOnHitManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme defining logics of handling hits for physical objects.
 */
export class SchemePhysicalOnHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalOnHitState {
    const state: ISchemePhysicalOnHitState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalOnHitState
  ): void {
    const manager: PhysicalOnHitManager = new PhysicalOnHitManager(object, state);

    state.action = manager;

    AbstractScheme.subscribe(state, manager);
  }

  public static override disable(object: GameObject, scheme: EScheme): void {
    const state: Optional<ISchemePhysicalOnHitState> = registry.objects.get(object.id())[
      scheme
    ] as Optional<ISchemePhysicalOnHitState>;

    if (state) {
      AbstractScheme.unsubscribe(state, state.action);
    }
  }
}
