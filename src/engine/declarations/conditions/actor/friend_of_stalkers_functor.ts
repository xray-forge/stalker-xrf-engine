import { extern } from "xray16/lib";

import { hasAchievedFriendOfStalkers } from "@/engine/core/utils/achievements";

/**
 * Check whether `friend of stalkers` is achieved.
 */
extern("xr_conditions.friend_of_stalkers_functor", (): boolean => {
  return hasAchievedFriendOfStalkers();
});
