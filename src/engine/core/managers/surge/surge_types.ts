import { Nillable, TName } from "xray16/lib";

import { TConditionList } from "@/engine/core/ini";

/**
 * Surge cover descriptor.
 */
export interface ISurgeCoverDescriptor {
  name: TName;
  conditionList: Nillable<TConditionList>;
}
