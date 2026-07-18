import { LuabindClass, property_evaluator } from "xray16";
import { Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Checks if object needs smart cover.
 */
@LuabindClass()
export class EvaluatorSmartCoverNeed extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorSmartCoverNeed.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether object should find any smart cover.
   */
  public override evaluate(): boolean {
    if (this.stateManager.targetState !== EStalkerState.SMART_COVER) {
      return false;
    }

    const smartCoverState: Nillable<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    return $isNotNil(smartCoverState) && $isNotNil(smartCoverState.coverName);
  }
}
