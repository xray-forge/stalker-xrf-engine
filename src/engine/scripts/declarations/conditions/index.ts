import { extern } from "@/engine/core/utils/binding";

// eslint-disable-next-line @typescript-eslint/no-var-requires
extern("xr_conditions", require("@/engine/scripts/declarations/conditions/conditions_old"));

require("@/engine/scripts/declarations/conditions/actor");
require("@/engine/scripts/declarations/conditions/game");
require("@/engine/scripts/declarations/conditions/object");
require("@/engine/scripts/declarations/conditions/quests");
require("@/engine/scripts/declarations/conditions/relation");
require("@/engine/scripts/declarations/conditions/static");
