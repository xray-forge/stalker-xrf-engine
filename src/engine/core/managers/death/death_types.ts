import { Nillable, TNumberId, TTimestamp } from "xray16/lib";

/**
 * Descriptor of object corpse stored for delayed releasing.
 */
export interface IReleaseDescriptor {
  /**
   * TODO: Persist the death time with a save-stable representation if delayed release after loading becomes required.
   *
   * Vanilla serialization stores only corpse IDs, so restored descriptors deliberately use `null` and are immediately
   * eligible for the idle-time check. The current game-update timestamp also restarts after loading.
   */
  diedAt: Nillable<TTimestamp>;
  id: TNumberId;
}
