import { LuabindClass, property_evaluator } from "xray16";
import { Nillable } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { registry } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme } from "@/engine/lib/types";

/**
 * Evaluator checking whether the object smart cover state is locked and mismatched with the configured cover.
 */
@LuabindClass()
export class EvaluatorSmartCoverLocked extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorSmartCoverLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether the object presence in a smart cover is out of sync with the configured cover name.
   *
   * @returns Whether the smart cover state is locked and needs to be resolved.
   */
  public override evaluate(): boolean {
    const smartCoverState: Nillable<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    if (!smartCoverState) {
      return false;
    }

    const isSmartCover: boolean = this.object.in_smart_cover();

    return (
      (isSmartCover && $isNil(smartCoverState.coverName)) || (!isSmartCover && $isNotNil(smartCoverState.coverName))
    );
  }
}
