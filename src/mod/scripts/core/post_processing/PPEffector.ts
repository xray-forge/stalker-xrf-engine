import { effector, effector_params, XR_effector, XR_effector_params } from "xray16";

import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PPEffector");

export interface IPPEffector extends XR_effector {
  params: XR_effector_params;
}

export const PPEffector: IPPEffector = declare_xr_class("PPEffector", effector, {
  __init(id_number: number): void {
    effector.__init(this, id_number, 10000000);
    this.params = new effector_params();
  },
  process(effector_params: XR_effector_params): boolean {
    effector_params.assign(this.params);
    effector.process(this, effector_params);

    return true;
  }
} as IPPEffector);
