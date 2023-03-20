import { stalker_ids, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { EvaluatorGatherItems } from "@/engine/core/schemes/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items/ISchemeGatherItemsState";
import { getConfigBoolean } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeGatherItems extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.GATHER_ITEMS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeGatherItemsState
  ): void {
    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.remove_evaluator(stalker_ids.property_items);
    actionPlanner.add_evaluator(stalker_ids.property_items, new EvaluatorGatherItems(state));
  }

  /**
   * todo;
   */
  public static setGatherItems(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assignStateAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.GATHER_ITEMS] as ISchemeGatherItemsState).gather_items_enabled = getConfigBoolean(
      state.ini!,
      section,
      "gather_items_enabled",
      object,
      false,
      true
    );
  }
}
