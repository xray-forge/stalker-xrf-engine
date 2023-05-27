import { effector, effector_params, LuabindClass } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { EffectorParams, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class PPEffector extends effector {
  public readonly params: EffectorParams = new effector_params();

  /**
   * todo: Description.
   */
  public constructor(idNumber: TNumberId) {
    super(idNumber, 10_000_000);
  }

  /**
   * todo: Description.
   */
  public override process(effectorParams: EffectorParams): boolean {
    effectorParams.assign(this.params);
    super.process(effectorParams);

    return true;
  }
}
