import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";

/** On surviving surge stop sleeping. */
extern("engine.surge_survive_end", (): void => getManager(ActorInputManager).onSurgeSurviveEnd());
