import { EActorMenuMode } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";

/** Actor menu mode callback. */
extern("actor_menu", {
  actor_menu_mode: (mode: EActorMenuMode): void => getManager(ActorInventoryMenuManager).setActiveMode(mode),
});
