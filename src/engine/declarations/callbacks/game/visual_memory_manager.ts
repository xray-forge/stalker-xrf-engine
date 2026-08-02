import { extern } from "xray16/lib";

import { calculateObjectVisibility } from "@/engine/core/ai/combat";

/** AI visual-memory callbacks. */
extern("visual_memory_manager", { get_visible_value: calculateObjectVisibility });
