import { GameObject } from "xray16/alias";
import { assert, extern, TLabel, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { NotificationManager, TNotificationIcon } from "@/engine/core/managers/notifications";

/**
 * Show tip in bottom left of game interface.
 */
extern(
  "xr_effects.send_tip",
  (_: GameObject, __: GameObject, [caption, icon, senderId]: [TLabel, TNotificationIcon, TStringId]): void => {
    assert(caption, "Expected caption to be provided for sent_tip effect.");
    getManager(NotificationManager).sendTipNotification(caption, icon, 0, null, senderId);
  }
);
