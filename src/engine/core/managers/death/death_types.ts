import { Optional, TNumberId, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IReleaseDescriptor {
  diedAt: Optional<TTimestamp>;
  id: TNumberId;
}
