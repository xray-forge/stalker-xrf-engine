import { EActiveItemSlot, EActorMenuMode, Optional, TDuration, Time } from "@/engine/lib/types";

export const actorConfig = {
  ACTOR_MENU_MODE: EActorMenuMode.UNDEFINED,
  // Input configuration:
  IS_WEAPON_HIDDEN: false,
  IS_WEAPON_HIDDEN_IN_DIALOG: false,
  IS_ACTOR_NIGHT_VISION_ENABLED: false,
  IS_ACTOR_TORCH_ENABLED: false,
  ACTIVE_ITEM_SLOT: EActiveItemSlot.PRIMARY,
  MEMOIZED_ITEM_SLOT: EActiveItemSlot.NONE,
  DISABLED_INPUT_AT: null as Optional<Time>,
  DISABLED_INPUT_DURATION: null as Optional<TDuration>,
};
