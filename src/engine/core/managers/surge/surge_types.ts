import { TConditionList } from "@/engine/core/utils/ini";
import { Nillable, TName } from "@/engine/lib/types";

/**
 * Surge cover descriptor.
 */
export interface ISurgeCoverDescriptor {
  name: TName;
  conditionList: Nillable<TConditionList>;
}
