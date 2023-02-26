import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorAbuse extends property_evaluator {
  public state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorAbuse.__name);
    this.state = storage;
  }

  public evaluate(): boolean {
    return this.state.abuse_manager.update();
  }
}
