import { extern } from "@/engine/core/utils/binding";

extern("xr_conditions.always", () => true);

extern("xr_conditions.never", () => false);
