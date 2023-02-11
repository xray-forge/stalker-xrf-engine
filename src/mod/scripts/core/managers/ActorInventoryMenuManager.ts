import { get_console, system_ini, XR_CConsole, XR_game_object, XR_ini_file } from "xray16";

import { getActor } from "@/mod/scripts/core/db";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActorInventoryMenuManager");

export enum EActorMenuMode {
  UNDEFINED = 0,
  INVENTORY = 1,
  TRADE = 2,
  UPGRADE = 3,
  DEAD_BODY_SEARCH = 4,
  TALK_DIALOG = 9,
  TALK_DIALOG_SHOW = 10,
  TALK_DIALOG_HIDE = 11,
}

// todo: .CUIActorMenu_OnItemDropped handler
export class ActorInventoryMenuManager extends AbstractCoreManager {
  public activeMode: EActorMenuMode = EActorMenuMode.UNDEFINED;

  public setActiveMode(nextMode: EActorMenuMode): void {
    if (nextMode === EActorMenuMode.UNDEFINED || nextMode === EActorMenuMode.TALK_DIALOG_HIDE) {
      this.closeActorMenu();
    } else {
      this.openActorMenu(nextMode);
    }
  }

  public closeActorMenu(): void {
    switch (this.activeMode) {
      case EActorMenuMode.INVENTORY:
      case EActorMenuMode.TRADE:
      case EActorMenuMode.UPGRADE:
      case EActorMenuMode.DEAD_BODY_SEARCH:
        this.onWindowClosed(this.activeMode);
        break;

      case EActorMenuMode.TALK_DIALOG_HIDE:
        this.onWindowClosed(EActorMenuMode.TALK_DIALOG);
        break;
    }

    this.activeMode = EActorMenuMode.UNDEFINED;
  }

  public openActorMenu(mode: EActorMenuMode): void {
    switch (mode) {
      case EActorMenuMode.INVENTORY:
      case EActorMenuMode.TRADE:
      case EActorMenuMode.UPGRADE:
      case EActorMenuMode.DEAD_BODY_SEARCH:
        this.activeMode = mode;

        return this.onWindowOpen(mode);

      case EActorMenuMode.TALK_DIALOG_SHOW:
        this.activeMode = EActorMenuMode.TALK_DIALOG;

        return this.onWindowOpen(mode);
    }
  }

  public isActiveMode(mode: EActorMenuMode): boolean {
    return this.activeMode === mode;
  }

  public initQuickSlotItems(): void {
    const console: XR_CConsole = get_console();
    const ini: XR_ini_file = system_ini();
    const actor: XR_game_object = getActor()!;

    console.execute("slot_0 " + getConfigString(ini, "actor", "quick_item_1", actor, false, "", ""));
    console.execute("slot_1 " + getConfigString(ini, "actor", "quick_item_2", actor, false, "", ""));
    console.execute("slot_2 " + getConfigString(ini, "actor", "quick_item_3", actor, false, "", ""));
    console.execute("slot_3 " + getConfigString(ini, "actor", "quick_item_4", actor, false, "", ""));
  }

  public onItemDropped(): void {
    logger.info("Actor menu inventory item dropped");
  }

  public onWindowOpen(mode: EActorMenuMode) {
    logger.info("Actor menu open:", EActorMenuMode[mode]);
  }

  public onWindowClosed(mode: EActorMenuMode) {
    logger.info("Actor menu close:", EActorMenuMode[mode]);
  }
}
