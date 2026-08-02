import { EActorMenuType, GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor/ActorInventoryMenuManager";
import { TradeManager } from "@/engine/core/managers/trade";

/** Actor inventory menu callbacks. */
extern("actor_menu_inventory", {
  CUIActorMenu_OnItemDropped: (
    from: GameObject,
    to: GameObject,
    oldList: EActorMenuType,
    newList: EActorMenuType
  ): boolean => {
    getManager(ActorInventoryMenuManager).onItemDropped(from, to, oldList, newList);

    return true;
  },
  CUIActorMenu_OnItemFocusReceive: (item: GameObject) =>
    getManager(ActorInventoryMenuManager).onItemFocusReceived(item),
  CUIActorMenu_OnItemFocusLost: (item: GameObject) => getManager(ActorInventoryMenuManager).onItemFocusLost(item),
  CInventory_ItemAvailableToTrade: (owner: GameObject, item: GameObject): boolean =>
    getManager(TradeManager).isItemAvailableForTrade(owner, item),
});
