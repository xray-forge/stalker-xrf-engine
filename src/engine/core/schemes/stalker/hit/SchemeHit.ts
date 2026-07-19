import { GameObject, IniFile } from "xray16/alias";
import { abort, Nillable, TSection } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { getConfigSwitchConditions } from "@/engine/core/ini";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/hit_types";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { getSchemeStateByKey } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

/**
 * Scheme describing how stalker object should handle being hit.
 */
export class SchemeHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeHitState {
    const state: ISchemeHitState = AbstractScheme.assign(object, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section '%s' for object '%s'.", section, object.name());
    }

    state.logic = getConfigSwitchConditions(ini, section);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeHitState
  ): void {
    const manager: HitManager = new HitManager(object, state);

    state.action = manager;

    AbstractScheme.subscribe(state, manager);
  }

  public static override disable(object: GameObject, scheme: EScheme): void {
    const state: Nillable<ISchemeHitState> = getSchemeStateByKey(registry.objects.get(object.id()), scheme);

    if (state) {
      AbstractScheme.unsubscribe(state, state.action);
    }
  }
}
