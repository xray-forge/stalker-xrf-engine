import type { ProfileTimer, TCount } from "@/engine/lib/types";

export interface IProfileSnapshotDescriptor {
  count: TCount;
  currentTimer: ProfileTimer;
  childTimer: ProfileTimer;
}
