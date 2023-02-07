import { stalker_ids, world_property, XR_action_base, XR_game_object, XR_ini_file } from "xray16";

import { communities } from "@/mod/globals/communities";
import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionSchemeCombatCamper } from "@/mod/scripts/core/logic/ActionSchemeCombatCamper";
import { ActionSchemeCombatZombied } from "@/mod/scripts/core/logic/ActionSchemeCombatZombied";
import { EvaluatorCheckCombat } from "@/mod/scripts/core/logic/evaluators/EvaluatorCheckCombat";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { getConfigCondList, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionSchemeCombat");

export class ActionSchemeCombat extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "combat";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      evaluators_id.script_combat,
      create_xr_class_instance(EvaluatorCheckCombat, EvaluatorCheckCombat.__name, state)
    );

    const action: XR_action_base = manager.action(stalker_ids.action_combat_planner);

    action.add_precondition(new world_property(evaluators_id.script_combat, false));

    ActionSchemeCombatZombied.add_to_binder(object, ini, scheme, section, state, manager);
    ActionSchemeCombatCamper.add_to_binder(object, ini, scheme, section, state, manager);
  }

  public static disable_scheme(object: XR_game_object, scheme: TScheme): void {
    const state = storage.get(object.id())[scheme];

    if (state !== null) {
      state.enabled = false;
    }
  }

  public static set_combat_type(npc: XR_game_object, actor: XR_game_object, target: Optional<AnyObject>): void {
    if (target === null) {
      return;
    }

    const state = storage.get(npc.id());

    state.enemy = npc.best_enemy();

    let script_combat_type = null;

    if (target.combat_type !== null) {
      script_combat_type = pickSectionFromCondList(actor, npc, target.combat_type.condlist);

      if (script_combat_type === "nil") {
        script_combat_type = null;
      }
    }

    state.script_combat_type = script_combat_type;
    target.script_combat_type = script_combat_type;
  }

  public static set_combat_checker(object: XR_game_object, ini: XR_ini_file, scheme: TScheme, section: TSection): void {
    const is_zombied: boolean = getCharacterCommunity(object) === communities.zombied;

    if (section || is_zombied) {
      const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

      st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
      st.enabled = true;

      st.combat_type = getConfigCondList(ini, section, "combat_type", object);

      if (st.combat_type === "monolith") {
        st.combat_type = null;
      }

      if (!st.combat_type && is_zombied) {
        st.combat_type = { condlist: parseCondList(object, section, "", "zombied") };
      }

      if (st.combat_type) {
        ActionSchemeCombat.set_combat_type(object, getActor()!, st);
      }
    }
  }
}
