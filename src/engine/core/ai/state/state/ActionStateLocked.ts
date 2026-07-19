import { action_base, LuabindClass } from "xray16";
import { TName } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Do nothing.
 * Action placeholder for state controller to not do anything when external logics is applied.
 */
@LuabindClass()
export class ActionStateLocked extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController, name: TName) {
    super(null, name || ActionStateLocked.__name);
    this.controller = controller;
  }
}
