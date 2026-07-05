import type { ProfileTimer } from "xray16/alias";
import type { TCount } from "xray16/lib";

export interface IProfileSnapshotDescriptor {
  count: TCount;
  currentTimer: ProfileTimer;
  childTimer: ProfileTimer;
}
