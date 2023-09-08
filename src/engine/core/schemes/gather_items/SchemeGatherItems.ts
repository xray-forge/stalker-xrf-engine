import { IRegistryObjectState } from "@/engine/core/database";
import { EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { EvaluatorGatherItems } from "@/engine/core/schemes/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items/ISchemeGatherItemsState";
import { readIniBoolean } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generic scheme to change object state and mark whether object has valuable items and can be looted.
 */
export class SchemeGatherItems extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.GATHER_ITEMS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * Activate scheme for an object - add to object state.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * Add custom gather items state logics for an object.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeGatherItemsState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.remove_evaluator(EEvaluatorId.ITEMS);
    planner.add_evaluator(EEvaluatorId.ITEMS, new EvaluatorGatherItems(state));
  }

  /**
   * Reset state for object.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.GATHER_ITEMS] as ISchemeGatherItemsState).canLootItems = readIniBoolean(
      state.ini,
      section,
      "gather_items_enabled",
      false,
      true
    );
  }
}
