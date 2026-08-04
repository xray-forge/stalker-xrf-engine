import { extern, TNumberId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";

/** Loading screen tip callbacks. */
extern("loadscreen", { get_tip_number: (): TNumberId => getManager(LoadScreenManager).getRandomTipIndex() });
