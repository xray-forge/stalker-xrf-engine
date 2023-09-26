import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { ISchemePhysicalOnHitState } from "@/engine/core/schemes/object/ph_on_hit/ISchemePhysicalOnHitState";
import { PhysicalOnHitManager } from "@/engine/core/schemes/object/ph_on_hit/PhysicalOnHitManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to handle hits as part of logic for physical objects.
 */
export class SchemePhysicalOnHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemePhysicalOnHitState {
    const state: ISchemePhysicalOnHitState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePhysicalOnHitState
  ): void {
    const manager: PhysicalOnHitManager = new PhysicalOnHitManager(object, state);

    state.action = manager;
    AbstractScheme.subscribe(object, state, manager);
  }

  /**
   * Handle disabling of the scheme.
   */
  public static override disable(object: ClientObject, scheme: EScheme): void {
    const state: Optional<ISchemePhysicalOnHitState> = registry.objects.get(object.id())[
      scheme
    ] as Optional<ISchemePhysicalOnHitState>;

    if (state) {
      AbstractScheme.unsubscribe(object, state, state.action);
    }
  }
}
