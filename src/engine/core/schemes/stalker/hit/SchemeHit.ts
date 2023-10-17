import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/hit_types";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override disable(object: GameObject, scheme: EScheme): void {
    const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[scheme] as Optional<ISchemeHitState>;

    if (state) {
      AbstractScheme.unsubscribe(object, state, state.action);
    }
  }

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

    AbstractScheme.subscribe(object, state, manager);
  }
}
