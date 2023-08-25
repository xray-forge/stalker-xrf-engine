import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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

    return destinationSmartCoverName === (stateDescription.cover_name || "");
  }
}
