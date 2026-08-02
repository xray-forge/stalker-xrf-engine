import { extern } from "xray16/lib";

import { smartCoversList } from "@/engine/core/animation/smart_covers";

/** Declare smart covers available to the engine. */
extern("smart_covers", { descriptions: smartCoversList });
