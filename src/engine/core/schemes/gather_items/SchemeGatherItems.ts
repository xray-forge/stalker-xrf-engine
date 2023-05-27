import { stalker_ids } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base";
import { EvaluatorGatherItems } from "@/engine/core/schemes/gather_items/evaluators";
import { ISchemeGatherItemsState } from "@/engine/core/schemes/gather_items/ISchemeGatherItemsState";
import { readIniBoolean } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeGatherItems extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.GATHER_ITEMS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeGatherItemsState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.remove_evaluator(stalker_ids.property_items);
    actionPlanner.add_evaluator(stalker_ids.property_items, new EvaluatorGatherItems(state));
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    (state[EScheme.GATHER_ITEMS] as ISchemeGatherItemsState).isGatherItemsEnabled = readIniBoolean(
      state.ini!,
      section,
      "gather_items_enabled",
      false,
      true
    );
  }
}
