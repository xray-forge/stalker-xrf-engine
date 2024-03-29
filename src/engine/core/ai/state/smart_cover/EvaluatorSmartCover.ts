import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme, Optional, TName } from "@/engine/lib/types";

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

    const stateDescription: Optional<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;
    const destinationSmartCoverName: Optional<TName> = this.object.get_dest_smart_cover_name();

    if (stateDescription === null) {
      return true;
    }

    return destinationSmartCoverName === (stateDescription.coverName || "");
  }
}
