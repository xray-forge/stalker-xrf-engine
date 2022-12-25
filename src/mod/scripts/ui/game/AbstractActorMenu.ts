import { AbstractSingletonManager } from "@/mod/scripts/core/AbstractSingletonManager";

export enum EActorMenuMode {
  UNDEFINED = 0,
  INVENTORY = 1,
  TRADE = 2,
  UPGRADE = 3,
  DEAD_BODY_SEARCH = 4,
  TALK_DIALOG = 9,
  TALK_DIALOG_SHOW = 10,
  TALK_DIALOG_HIDE = 11
}

export abstract class AbstractActorMenu extends AbstractSingletonManager {
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

  public onWindowClosed(mode: EActorMenuMode): void {}

  public onWindowOpen(mode: EActorMenuMode): void {}
}
