import { extern } from "@/engine/core/utils/binding";

// eslint-disable-next-line @typescript-eslint/no-var-requires
extern("xr_effects", require("@/engine/scripts/declarations/effects/effects_old"));

require("@/engine/scripts/declarations/effects/actor");
require("@/engine/scripts/declarations/effects/quests");
