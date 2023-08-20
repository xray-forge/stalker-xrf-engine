import { effector, effector_params, LuabindClass } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { EffectorParams, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Custom post process effector to intercept and customize parameters from scripts.
 */
@LuabindClass()
export class PostProcessEffector extends effector {
  public readonly params: EffectorParams = new effector_params();

  public constructor(idNumber: TNumberId) {
    super(idNumber, 10_000_000);
  }

  /**
   * Override processing to use custom provided parameters.
   */
  public override process(effectorParams: EffectorParams): boolean {
    effectorParams.assign(this.params);
    super.process(effectorParams);

    return true;
  }
}
