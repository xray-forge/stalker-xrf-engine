import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SleepManager } from "@/engine/core/managers/sleep";

/** On actor stop sleeping. */
extern("engine.on_finish_sleeping", (): void => getManager(SleepManager).onFinishSleeping());
