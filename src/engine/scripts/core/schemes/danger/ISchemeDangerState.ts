import { Optional, TTimestamp } from "@/engine/lib/types";
import { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  danger_time: Optional<TTimestamp>;
}
