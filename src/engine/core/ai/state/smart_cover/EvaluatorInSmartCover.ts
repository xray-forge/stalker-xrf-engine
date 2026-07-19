import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Evaluate object smart cover state and whether it is in smart cover right now.
 */
@LuabindClass()
export class EvaluatorInSmartCover extends property_evaluator {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorInSmartCover.__name);
    this.controller = controller;
  }

  /**
   * Check if object is in smart cover right now.
   */
  public override evaluate(): boolean {
    return this.object.in_smart_cover();
  }
}
