import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, registry } from "@/mod/scripts/core/db";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalOnDeath");

/**
 * todo;
 */
export class SchemePhysicalOnDeath extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_DEATH;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const action: SchemePhysicalOnDeath = new SchemePhysicalOnDeath(object, storage);

    storage.action = action;

    subscribeActionForEvents(object, storage, action);
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", object.name());

    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    // ---  npc:set_callback(callback.death, nil)
  }

  public death_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    if (registry.objects.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, registry.actor)) {
        return;
      }
    }
  }
}
