import type { IBaseSchemeLogic, IBaseSchemeState } from "@/engine/core/database";
import type { IBoneStateDescriptor } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TLabel } from "@/engine/lib/types";

/**
 * Descriptor to describe idle state scheme.
 */
export interface ISchemePhysicalIdleState extends IBaseSchemeState {
  // List of condists for each bone index hit handling.
  bonesHitCondlists: LuaArray<IBoneStateDescriptor>;
  // Whether object should be set as nonscript usable.
  isNonscriptUsable: boolean;
  // Logics to apply when object is used.
  onUse: Optional<IBaseSchemeLogic>;
  // Tip to disable when hover over object.
  tip: TLabel;
}
