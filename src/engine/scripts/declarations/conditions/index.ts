import { extern } from "@/engine/core/utils/binding";

// eslint-disable-next-line @typescript-eslint/no-var-requires
extern("xr_conditions", require("@/engine/scripts/declarations/conditions/conditions_old"));

require("@/engine/scripts/declarations/conditions/static");
