import { XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { ActionProcessEnemy } from "@/mod/scripts/core/logic/actions/ActionProcessEnemy";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { generic_scheme_overrides } from "@/mod/scripts/core/schemes/generic_scheme_overrides";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { unsubscribeActionFromEvents } from "@/mod/scripts/core/schemes/unsubscribeActionFromEvents";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeCombatIgnore");

export class ActionSchemeCombatIgnore extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.COMBAT_IGNORE;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    state.action = new ActionProcessEnemy(object, state);
  }

  public static set_combat_ignore_checker(npc: XR_game_object, ini: XR_ini_file, scheme: EScheme): void {
    assignStorageAndBind(npc, ini, scheme, null);
  }

  public static disable_scheme(npc: XR_game_object, scheme: EScheme): void {
    npc.set_enemy_callback(null);

    const schemeState = storage.get(npc.id())[scheme];

    if (schemeState) {
      unsubscribeActionFromEvents(npc, schemeState, schemeState.action);
    }
  }

  public static resetScheme(object: XR_game_object, scheme: EScheme, state: IStoredObject, section: TSection): void {
    const schemeState = state.combat_ignore as any;

    object.set_enemy_callback(schemeState.action.enemy_callback, schemeState.action);

    subscribeActionForEvents(object, schemeState, schemeState.action);

    schemeState.overrides = generic_scheme_overrides(object);
    schemeState.enabled = true;
  }
}
