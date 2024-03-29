import { extern } from "@/engine/core/utils/binding";

extern("xr_effects", {});

require("@/engine/scripts/declarations/effects/actor");
require("@/engine/scripts/declarations/effects/game");
require("@/engine/scripts/declarations/effects/object");
require("@/engine/scripts/declarations/effects/position");
require("@/engine/scripts/declarations/effects/post_process");
require("@/engine/scripts/declarations/effects/quests");
require("@/engine/scripts/declarations/effects/relation");
require("@/engine/scripts/declarations/effects/world");
