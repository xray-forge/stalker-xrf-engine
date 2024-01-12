import { SleepDialog } from "@/engine/core/ui/game/sleep";
import { storyNames } from "@/engine/lib/constants/story_names";
import { Optional, TName } from "@/engine/lib/types";

export const sleepConfig = {
  SLEEP_DIALOG: null as Optional<SleepDialog>,
  SLEEP_ZONES: $fromArray<TName>([
    storyNames.zat_a2_sr_sleep,
    storyNames.jup_a6_sr_sleep,
    storyNames.pri_a16_sr_sleep,
    storyNames.actor_surge_hide_2,
  ]),
};
