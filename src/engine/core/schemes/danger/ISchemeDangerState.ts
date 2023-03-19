import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { Optional, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  danger_time: Optional<TTimestamp>;
}
