import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { TSection } from "xray16/lib";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState } from "@/engine/core/database";
import { readIniBoolean } from "@/engine/core/ini";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { EvaluatorGatherItems } from "@/engine/core/schemes/stalker/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/stalker/gather_items/gather_items_types";
import { getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";

/**
 * Generic scheme to change object state and mark whether object has valuable items and can be looted.
 */
export class SchemeGatherItems extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.GATHER_ITEMS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeGatherItemsState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeGatherItemsState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.remove_evaluator(EEvaluatorId.ITEMS);
    planner.add_evaluator(EEvaluatorId.ITEMS, new EvaluatorGatherItems(state));
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    getSchemeStateOptimistic(state, EScheme.GATHER_ITEMS).canLootItems = readIniBoolean(
      state.ini,
      section,
      "gather_items_enabled",
      false,
      true
    );
  }
}
