import { Optional, TNumberId, TTimestamp } from "@/engine/lib/types";

/**
 * Descriptor of object corpse stored for delayed releasing.
 */
export interface IReleaseDescriptor {
  // todo: Use CTime here to transfer it after game save/load.
  // todo: Current variant with game update TS may be not the most reliable one.
  // todo: Update timer ticks from 0 after game load.
  diedAt: Optional<TTimestamp>;
  id: TNumberId;
}
