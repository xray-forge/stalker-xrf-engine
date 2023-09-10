import { TConditionList } from "@/engine/core/utils/ini";
import { Optional, TName } from "@/engine/lib/types";

/**
 * Surge cover descriptor.
 */
export interface ISurgeCoverDescriptor {
  name: TName;
  conditionList: Optional<TConditionList>;
}
