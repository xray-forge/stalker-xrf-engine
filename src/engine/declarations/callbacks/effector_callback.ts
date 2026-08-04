import { extern } from "xray16/lib";

import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils";

/** Handle a finished cutscene camera effect. */
extern("engine.effector_callback", (): void => emitCutsceneEndedEvent());
