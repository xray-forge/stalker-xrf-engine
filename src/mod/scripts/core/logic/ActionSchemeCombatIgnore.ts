import { XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionProcessEnemy } from "@/mod/scripts/core/logic/actions/ActionProcessEnemy";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeCombatIgnore");

export class ActionSchemeCombatIgnore extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "combat_ignore";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    state.action = new ActionProcessEnemy(object, state);
  }

  public static set_combat_ignore_checker(npc: XR_game_object, ini: XR_ini_file, scheme: TScheme): void {
    get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(npc, ini, scheme);
  }

  public static disable_scheme(npc: XR_game_object, scheme: TScheme): void {
    npc.set_enemy_callback(null);

    const schemeState = storage.get(npc.id())[scheme];

    if (schemeState) {
      get_global<AnyCallablesModule>("xr_logic").unsubscribe_action_from_events(npc, schemeState, schemeState.action);
    }
  }

  public static reset_combat_ignore_checker(
    npc: XR_game_object,
    scheme: TScheme,
    st: IStoredObject,
    section: TSection
  ): void {
    const schemeState = st.combat_ignore as any;

    npc.set_enemy_callback(schemeState.action.enemy_callback, schemeState.action);

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, schemeState, schemeState.action);

    schemeState.overrides = get_global<AnyCallablesModule>("xr_logic").generic_scheme_overrides(npc);

    schemeState.enabled = true;
  }
}
