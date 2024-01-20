import type { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import type { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import type { HelicopterLookManager } from "@/engine/core/schemes/helicopter/heli_move/look";
import type { TNumberId } from "@/engine/lib/types";

export const helicopterConfig = {
  HELICOPTER_FIRE_MANAGERS: new LuaTable<TNumberId, HelicopterFireManager>(),
  HELICOPTER_FLY_MANAGERS: new LuaTable<TNumberId, HelicopterFlyManager>(),
  HELICOPTER_LOOK_MANAGERS: new LuaTable<TNumberId, HelicopterLookManager>(),
  HELICOPTER_STATIC_UI_XML_PATH: "game\\heli\\heli_progress.xml",
  // Configuration fields:
  COMBAT_TYPE_CHANGE_DELAY: 5_000,
  VISIBILITY_DELAY: 3_000,
  SEARCH_SHOOT_DELAY: 2_000,
  ROUND_SHOOT_DELAY: 2_000,
};
