import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/** On anabiotic used and start sleeping. */
extern("engine.on_anabiotic_sleep", (): void => getManager(ActorInputManager).onAnabioticSleep());
