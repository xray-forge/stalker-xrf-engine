import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/smartcover";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorSmartCoverLocked extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorSmartCoverLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const smartCoverState: Optional<ISchemeSmartCoverState> = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    if (smartCoverState === null) {
      return false;
    }

    const isSmartCover: boolean = this.object.in_smart_cover();

    return (
      (isSmartCover && smartCoverState.cover_name === null) || (!isSmartCover && smartCoverState.cover_name !== null)
    );
  }
}
