import { extern } from "xray16/lib";

import { achievementsPreconditionsMap } from "@/engine/core/utils/achievements";

/** Achievement checkers called from C++. */
extern("engine.check_achievement", achievementsPreconditionsMap);
