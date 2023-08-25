import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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

    const smartCoverState: Optional<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    return smartCoverState !== null && smartCoverState.cover_name !== null;
  }
}
