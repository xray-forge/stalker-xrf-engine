import { action_base, LuabindClass, move } from "xray16";
import { TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { registry } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme } from "@/engine/core/schemes/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to enter some specific smart cover based on object schema state.
 */
@LuabindClass()
export class ActionSmartCoverEnter extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionSmartCoverEnter.__name);
    this.controller = controller;
  }

  /**
   * Set current smart cover / loophole based on schema state.
   */
  public override initialize(): void {
    logger.info("Enter smart cover: %s", this.object.name());

    super.initialize();

    const smartCoverState: ISchemeSmartCoverState = registry.objects.get(this.object.id())[
      EScheme.SMARTCOVER
    ] as ISchemeSmartCoverState;

    this.object.use_smart_covers_only(true);
    this.object.set_movement_type(move.run);
    this.object.set_dest_smart_cover(smartCoverState.coverName as TName);

    if (smartCoverState.loopholeName) {
      this.object.set_dest_loophole(smartCoverState.loopholeName);
    }
  }
}
