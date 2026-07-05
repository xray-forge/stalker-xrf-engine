import type { ProfileTimer } from "xray16/alias";

import type { TCount } from "@/engine/lib/types";

export interface IProfileSnapshotDescriptor {
  count: TCount;
  currentTimer: ProfileTimer;
  childTimer: ProfileTimer;
}
