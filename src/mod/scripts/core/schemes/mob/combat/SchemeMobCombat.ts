import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeMobCombat");

/**
 * todo
 */
export class SchemeMobCombat extends AbstractScheme {
  public static readonly SCHEME_SECTION: EScheme = EScheme.MOB_COMBAT;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const new_action: SchemeMobCombat = new SchemeMobCombat(object, storage);

    storage.action = new_action;

    subscribeActionForEvents(object, storage, new_action);
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name?: string
  ): void {
    logger.info("Set scheme:", object?.name(), scheme, section);

    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.enabled = true;
  }

  public static disable_scheme(this: void, object: XR_game_object, scheme: EScheme): void {
    const state = registry.objects.get(object.id())[scheme];

    if (state !== null) {
      state.enabled = false;
    }
  }

  // todo: Is it needed at all?
  public combat_callback(): void {
    if (this.state.enabled && this.object.get_enemy() !== null) {
      if (registry.objects.get(this.object.id()).active_scheme !== null) {
        if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
          return;
        }
      }
    }
  }
}
