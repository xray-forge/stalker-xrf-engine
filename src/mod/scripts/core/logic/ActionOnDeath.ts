import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionOnDeath");

export class ActionOnDeath extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_DEATH;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());

    const action: ActionOnDeath = new ActionOnDeath(npc, storage);

    storage.action = action;

    subscribeActionForEvents(npc, storage, action);
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", npc.name());

    const st = assignStorageAndBind(npc, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, npc);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    // ---  npc:set_callback(callback.death, nil)
  }

  public death_callback(object: XR_game_object, who: Optional<XR_game_object>): void {
    if (storage.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, getActor())) {
        return;
      }
    }
  }
}
