import { system_ini, XR_ini_file } from "xray16";

import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { ACTOR } from "@/engine/lib/constants/words";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Current state of actor menu interaction.
 */
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

  /**
   * todo: Description.
   */
  public override initialize(): void {
    logger.info("Initialize actor inventory quick items slots");

    const ini: XR_ini_file = system_ini();

    executeConsoleCommand(console_commands.slot_0, readIniString(ini, ACTOR, "quick_item_1", false, "", ""));
    executeConsoleCommand(console_commands.slot_1, readIniString(ini, ACTOR, "quick_item_2", false, "", ""));
    executeConsoleCommand(console_commands.slot_2, readIniString(ini, ACTOR, "quick_item_3", false, "", ""));
    executeConsoleCommand(console_commands.slot_3, readIniString(ini, ACTOR, "quick_item_4", false, "", ""));
  }

  /**
   * todo: Description.
   */
  public setActiveMode(nextMode: EActorMenuMode): void {
    if (nextMode === EActorMenuMode.UNDEFINED || nextMode === EActorMenuMode.TALK_DIALOG_HIDE) {
      this.closeActorMenu();
    } else {
      this.openActorMenu(nextMode);
    }
  }

  /**
   * todo: Description.
   */
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

  /**
   * todo: Description.
   */
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

  /**
   * todo: Description.
   */
  public isActiveMode(mode: EActorMenuMode): boolean {
    return this.activeMode === mode;
  }

  /**
   * todo: Description.
   */
  public onItemDropped(): void {
    logger.info("Actor menu inventory item dropped");
  }

  /**
   * todo: Description.
   */
  public onWindowOpen(mode: EActorMenuMode) {
    logger.info("Actor menu open:", EActorMenuMode[mode]);
  }

  /**
   * todo: Description.
   */
  public onWindowClosed(mode: EActorMenuMode) {
    logger.info("Actor menu close:", EActorMenuMode[mode]);
  }
}
