import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit/ISchemeHitState";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override disable(object: ClientObject, scheme: EScheme): void {
    const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[scheme] as ISchemeHitState;

    if (state !== null) {
      SchemeHit.unsubscribe(object, state, state.action);
    }
  }

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeHitState = AbstractScheme.assign(object, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section [%s] for object [%s]", section, object.name());
    }

    state.logic = getConfigSwitchConditions(ini, section);

    SchemeHit.subscribe(object, state, state.action);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    storage: ISchemeHitState
  ): void {
    storage.action = new HitManager(object, storage);
  }
}
