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

const logger: LuaLogger = new LuaLogger("MobDeath");

export class ActionMobDeath extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.MOB_DEATH;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());
    subscribeActionForEvents(npc, storage, new ActionMobDeath(npc, storage));
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name?: string
  ): void {
    logger.info("Set scheme:", npc.name(), scheme, section);

    const state = assignStorageAndBind(npc, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, npc);
  }

  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    let death = storage.get(victim.id()).death!;

    if (death === null) {
      death = {} as any;
      storage.get(victim.id()).death = death;
    }

    if (who !== null) {
      death.killer = who.id();
      death.killer_name = who.name();
    } else {
      death.killer = -1;
      death.killer_name = null;
    }

    if (trySwitchToAnotherSection(victim, this.state, getActor())) {
      return;
    }
  }
}
