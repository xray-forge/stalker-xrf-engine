import { SYSTEM_INI } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { ACTOR, NIL } from "@/engine/lib/constants/words";
import { ClientObject, EActorMenuMode, EActorMenuType, IniFile } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

// todo: .CUIActorMenu_OnItemDropped handler
export class ActorInventoryMenuManager extends AbstractManager {
  public activeMode: EActorMenuMode = EActorMenuMode.UNDEFINED;

  /**
   * todo: Description.
   */
  public override initialize(): void {
    const ini: IniFile = SYSTEM_INI;

    executeConsoleCommand(consoleCommands.slot_0, readIniString(ini, ACTOR, "quick_item_1", false, null, ""));
    executeConsoleCommand(consoleCommands.slot_1, readIniString(ini, ACTOR, "quick_item_2", false, null, ""));
    executeConsoleCommand(consoleCommands.slot_2, readIniString(ini, ACTOR, "quick_item_3", false, null, ""));
    executeConsoleCommand(consoleCommands.slot_3, readIniString(ini, ACTOR, "quick_item_4", false, null, ""));
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
  public onItemDropped(from: ClientObject, to: ClientObject, oldList: EActorMenuType, newList: EActorMenuType): void {
    logger.info("Actor menu inventory item dropped:", from?.name() || NIL, to?.name() || NIL, oldList, newList);
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
