import { Optional, TTimestamp } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeDangerState extends IBaseSchemeState {
  danger_time: Optional<TTimestamp>;
}
