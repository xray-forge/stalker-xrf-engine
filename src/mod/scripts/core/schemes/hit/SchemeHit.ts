import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { HitManager } from "@/mod/scripts/core/schemes/hit/HitManager";
import { ISchemeHitState } from "@/mod/scripts/core/schemes/hit/ISchemeHitState";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/schemes/unsubscribeActionFromEvents";
import { getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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
