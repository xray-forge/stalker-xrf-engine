import { stalker_ids, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { EvaluatorGatherItems } from "@/mod/scripts/core/logic/GatherItemsEvaluator";
import { getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionGatherItems");

export class ActionGatherItems extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "gather_items";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.name());

    const manager = object.motivation_action_manager();

    manager.remove_evaluator(stalker_ids.property_items);
    manager.add_evaluator(
      stalker_ids.property_items,
      create_xr_class_instance(EvaluatorGatherItems, "is_there_items_to_pickup", state, object)
    );
  }

  public static set_gather_items(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    log.info("Set gather items:", object.name());

    get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);
  }

  public static reset_gather_items(
    object: XR_game_object,
    scheme: string,
    state: IStoredObject,
    section: string
  ): void {
    log.info("Set gather items:", object.name());

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
