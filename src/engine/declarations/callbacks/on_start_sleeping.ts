import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SleepManager } from "@/engine/core/managers/sleep";

/** On actor start sleeping. */
extern("engine.on_start_sleeping", (): void => getManager(SleepManager).onStartSleeping());
