import { LuabindClass, property_evaluator } from "xray16";
import { Nillable, TName } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Checks if object is going to a desired smart cover.
 */
@LuabindClass()
export class EvaluatorSmartCover extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorSmartCover.__name);
    this.stateManager = stateManager;
  }

  /**
   * Verify whether object should be in smart cover and if destination smart cover is desired one.
   */
  public override evaluate(): boolean {
    if (this.stateManager.targetState !== EStalkerState.SMART_COVER) {
      return true;
    }

    const stateDescription: Nillable<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;
    const destinationSmartCoverName: Nillable<TName> = this.object.get_dest_smart_cover_name();

    return $isNil(stateDescription) ? true : destinationSmartCoverName === (stateDescription.coverName || "");
  }
}
