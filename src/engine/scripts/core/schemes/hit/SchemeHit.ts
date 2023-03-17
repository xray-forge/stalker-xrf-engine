import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { AbstractScheme } from "@/engine/scripts/core/schemes/base/AbstractScheme";
import { HitManager } from "@/engine/scripts/core/schemes/hit/HitManager";
import { ISchemeHitState } from "@/engine/scripts/core/schemes/hit/ISchemeHitState";
import { subscribeActionForEvents } from "@/engine/scripts/core/schemes/subscribeActionForEvents";
import { unsubscribeActionFromEvents } from "@/engine/scripts/core/schemes/unsubscribeActionFromEvents";
import { abort } from "@/engine/scripts/utils/debug";
import { getConfigSwitchConditions } from "@/engine/scripts/utils/ini_config/config";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeHit extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.HIT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: ISchemeHitState
  ): void {
    storage.action = new HitManager(object, storage);
  }

  /**
   * todo;
   */
  public static override disableScheme(object: XR_game_object, scheme: EScheme): void {
    const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[scheme] as ISchemeHitState;

    if (state !== null) {
      unsubscribeActionFromEvents(object, state, state.action);
    }
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: ISchemeHitState = AbstractScheme.assignStateAndBind(object, ini, scheme, section);

    if (!ini.section_exist(section)) {
      abort("There is no section [%s] for npc [%s]", section, object.name());
    }

    state.logic = getConfigSwitchConditions(ini, section, object);

    subscribeActionForEvents(object, state, state.action);
  }
}
