import { stalker_ids, XR_game_object, XR_ini_file } from "xray16";

import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject } from "@/mod/scripts/core/db";
import { assign_storage_and_bind } from "@/mod/scripts/core/logic";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { EvaluatorGatherItems } from "@/mod/scripts/core/logic/evaluators/EvaluatorGatherItems";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionGatherItems");

export class ActionGatherItems extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "gather_items";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const manager = object.motivation_action_manager();

    manager.remove_evaluator(stalker_ids.property_items);
    manager.add_evaluator(
      stalker_ids.property_items,
      create_xr_class_instance(EvaluatorGatherItems, "is_there_items_to_pickup", state, object)
    );
  }

  public static set_gather_items(object: XR_game_object, ini: XR_ini_file, scheme: TScheme, section: TSection): void {
    logger.info("Set gather items:", object.name());

    assign_storage_and_bind(object, ini, scheme, section);
  }

  public static reset_gather_items(
    object: XR_game_object,
    scheme: string,
    state: IStoredObject,
    section: TSection
  ): void {
    logger.info("Set gather items:", object.name());

    state.gather_items.gather_items_enabled = getConfigBoolean(
      state.ini!,
      section,
      "gather_items_enabled",
      object,
      false,
      true
    );
  }
}
