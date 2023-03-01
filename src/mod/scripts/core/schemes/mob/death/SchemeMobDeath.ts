import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeMobDeath");

/**
 * todo;
 */
export class SchemeMobDeath extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_DEATH;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    subscribeActionForEvents(object, storage, new SchemeMobDeath(object, storage));
  }

  public static override set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name?: string
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
  }

  public death_callback(victim: XR_game_object, who: Optional<XR_game_object>): void {
    let death = registry.objects.get(victim.id()).death!;

    if (death === null) {
      death = {} as any;
      registry.objects.get(victim.id()).death = death;
    }

    if (who !== null) {
      death.killer = who.id();
      death.killer_name = who.name();
    } else {
      death.killer = -1;
      death.killer_name = null;
    }

    if (trySwitchToAnotherSection(victim, this.state, registry.actor)) {
      return;
    }
  }
}
