import { XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/schemes/unsubscribeActionFromEvents";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionOnHit");

export class ActionOnHit extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_ON_HIT;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());

    storage.action = new ActionOnHit(npc, storage);
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", npc.name());

    const st = assignStorageAndBind(npc, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, npc);
    subscribeActionForEvents(npc, st, st.action);
  }

  public static disable_scheme(npc: XR_game_object, scheme: string): void {
    const st = storage.get(npc.id())[scheme];

    if (st) {
      unsubscribeActionFromEvents(npc, st, st.action);
    }
  }

  public hit_callback(
    object: XR_game_object,
    amount: number,
    local_direction: XR_vector,
    who: Optional<XR_game_object>,
    bone_index: number
  ): void {
    const who_name: string = who ? who.name() : "nil";

    logger.info("Object hit:", object.name(), "<-", who_name, amount);

    if (storage.get(this.object.id()).active_scheme) {
      if (trySwitchToAnotherSection(object, this.state, getActor())) {
        return;
      }
    }
  }
}
