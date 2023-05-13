import { extern } from "@/engine/core/utils/binding";

// eslint-disable-next-line @typescript-eslint/no-var-requires
extern("xr_effects", require("@/engine/scripts/declarations/effects/effects_old"));

require("@/engine/scripts/declarations/effects/actor");
require("@/engine/scripts/declarations/effects/position");
require("@/engine/scripts/declarations/effects/quests");
require("@/engine/scripts/declarations/effects/object");
require("@/engine/scripts/declarations/effects/relation");
require("@/engine/scripts/declarations/effects/world");
