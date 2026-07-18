import type { LuaArray, Nillable, TLabel } from "xray16/lib";

import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/schemes/state";
import type { IBoneStateDescriptor } from "@/engine/core/utils/ini";
import type { EScheme } from "@/engine/lib/types";

/**
 * Descriptor to describe idle state scheme.
 */
export interface ISchemePhysicalIdleState extends IBaseSchemeState {
  // List of condists for each bone index hit handling.
  bonesHitCondlists: LuaArray<IBoneStateDescriptor>;
  // Whether object should be set as nonscript usable.
  isNonscriptUsable: boolean;
  // Logics to apply when object is used.
  onUse: Nillable<IBaseSchemeLogic>;
  // Tip to disable when hover over object.
  tip: TLabel;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.PH_IDLE]: ISchemePhysicalIdleState;
  }
}
