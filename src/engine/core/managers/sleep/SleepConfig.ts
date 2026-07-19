import { Nillable, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { storyNames } from "@/engine/constants/story_names";
import { SleepDialog } from "@/engine/core/ui/game/sleep";

export const sleepConfig = {
  SLEEP_DIALOG: null as Nillable<SleepDialog>,
  SLEEP_ZONES: $fromArray<TName>([
    storyNames.zat_a2_sr_sleep,
    storyNames.jup_a6_sr_sleep,
    storyNames.pri_a16_sr_sleep,
    storyNames.actor_surge_hide_2,
  ]),
};
