import {
  alife,
  CMainMenu,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIStatic,
  DIK_keys,
  Frect,
  game,
  IsGameTypeSingle,
  level,
  LuabindClass,
  main_menu,
  ui_events,
} from "xray16";

import { registry } from "@/engine/core/database";
import { EGameEvent } from "@/engine/core/managers/events/events_types";
import { EventsManager } from "@/engine/core/managers/events/EventsManager";
import { DebugDialog } from "@/engine/core/ui/debug/DebugDialog";
import { ExtensionsDialog } from "@/engine/core/ui/menu/extensions/ExtensionsDialog";
import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { MultiplayerGameSpy } from "@/engine/core/ui/menu/multiplayer_login/MultiplayerGamespy";
import { MultiplayerLocalnet } from "@/engine/core/ui/menu/multiplayer_login/MultiplayerLocalnet";
import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { SaveDialog } from "@/engine/core/ui/menu/save/SaveDialog";
import { loadLastGameSave, startNewGame } from "@/engine/core/utils/game";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { gameTutorials } from "@/engine/lib/constants/game_tutorials";
import { gameTypes } from "@/engine/lib/constants/game_types";
import {
  AccountManager,
  ClientObject,
  LoginManager,
  Optional,
  Profile,
  ProfileStore,
  TKeyCode,
  TNumberId,
  TPath,
  TUIEvent,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const base: TPath = "menu\\MainMenu.component";

enum EMainMenuModalMode {
  OFF,
  ON,
  CONFIRM_LOAD_SAVE,
}

/**
 * Main game menu component implementation.
 */
@LuabindClass()
export class MainMenu extends CUIScriptWnd {
  public readonly xrMenuController: CMainMenu = main_menu.get_main_menu();
  public xrMenuPageController!: CUIMMShniaga;

  public readonly xrAccountManager: AccountManager;
  public readonly xrProfileStore: ProfileStore;
  public readonly xrLoginManager: LoginManager;
  public xrGameSpyProfile: Optional<Profile>;

  public uiModalBox!: CUIMessageBoxEx;
  public modalBoxMode: EMainMenuModalMode = EMainMenuModalMode.OFF;

  public uiMultiplayerMenuDialog: Optional<MultiplayerMenu> = null;
  public uiGameOptionsDialog: Optional<OptionsDialog> = null;
  public uiGameSavesSaveDialog: Optional<SaveDialog> = null;
  public uiGameSavesLoadDialog: Optional<LoadDialog> = null;
  public uiLocalnetDialog: Optional<MultiplayerLocalnet> = null;
  public uiGamespyDialog: Optional<MultiplayerGameSpy> = null;
  public uiGameDebugDialog: Optional<DebugDialog> = null;
  public uiGameExtensionsDialog: Optional<ExtensionsDialog> = null;

  public constructor() {
    super();

    this.xrLoginManager = this.xrMenuController.GetLoginMngr();
    this.xrAccountManager = this.xrMenuController.GetAccountMngr();
    this.xrProfileStore = this.xrMenuController.GetProfileStore();
    this.xrGameSpyProfile = this.xrLoginManager.get_current_profile();

    this.initControls();
    this.initCallBacks();

    EventsManager.emitEvent(EGameEvent.MAIN_MENU_ON);
  }

  /**
   * Initialize UI controls.
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: CScriptXmlInit = resolveXmlFile(base);

    xml.InitStatic("background", this);

    this.uiModalBox = new CUIMessageBoxEx();
    this.xrMenuPageController = xml.InitMMShniaga("shniaga_wnd", this);

    this.Register(this.uiModalBox, "msg_box");

    const versionLabel: CUIStatic = xml.InitStatic("static_version", this);

    versionLabel.TextControl().SetText(string.format(gameConfig.VERSION, this.xrMenuController.GetGSVer()));

    // Reset magnifier mode.
    if (this.xrGameSpyProfile && !level.present()) {
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
      this.xrMenuPageController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main_logout");
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
    }
  }

  /**
   * Initialize callback handlers of main menu buttons.
   */
  public initCallBacks(): void {
    this.AddCallback("btn_novice", ui_events.BUTTON_CLICKED, () => startNewGame(gameDifficulties.gd_novice), this);
    this.AddCallback("btn_stalker", ui_events.BUTTON_CLICKED, () => startNewGame(gameDifficulties.gd_stalker), this);
    this.AddCallback("btn_veteran", ui_events.BUTTON_CLICKED, () => startNewGame(gameDifficulties.gd_veteran), this);
    this.AddCallback("btn_master", ui_events.BUTTON_CLICKED, () => startNewGame(gameDifficulties.gd_master), this);
    this.AddCallback("btn_options", ui_events.BUTTON_CLICKED, () => this.onOptionsButtonClick(), this);
    this.AddCallback("btn_load", ui_events.BUTTON_CLICKED, () => this.onLoadGameButtonClick(), this);
    this.AddCallback("btn_save", ui_events.BUTTON_CLICKED, () => this.onSaveGameButtonClick(), this);

    this.AddCallback("btn_net_game", ui_events.BUTTON_CLICKED, () => this.onNetworkGameButtonClick(), this);
    this.AddCallback("btn_internet", ui_events.BUTTON_CLICKED, () => this.onInternetButtonClick(), this);
    this.AddCallback("btn_localnet", ui_events.BUTTON_CLICKED, () => this.onLocalnetButtonClick(), this);
    this.AddCallback("btn_multiplayer", ui_events.BUTTON_CLICKED, () => this.onMultiplayerButtonClick(), this);
    this.AddCallback("btn_logout", ui_events.BUTTON_CLICKED, () => this.onLogoutButtonClick(), this);

    this.AddCallback("btn_quit", ui_events.BUTTON_CLICKED, () => this.onQuitToWindowsButtonClick(), this);
    this.AddCallback("btn_quit_to_mm", ui_events.BUTTON_CLICKED, () => this.onDisconnectButtonClick(), this);
    this.AddCallback("btn_ret", ui_events.BUTTON_CLICKED, () => this.onReturnToGameButtonClick(), this);
    this.AddCallback("btn_lastsave", ui_events.BUTTON_CLICKED, () => this.onLoadLastSaveButtonClick(), this);
    this.AddCallback("btn_extensions", ui_events.BUTTON_CLICKED, () => this.onExtensionsButtonClick(), this);
    this.AddCallback("btn_credits", ui_events.BUTTON_CLICKED, () => this.onGameCreditsButtonClick(), this);

    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onMessageBoxOkClick(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_CANCEL_CLICKED, () => this.onMessageBoxCancelClick(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onMessageBoxConfirmClick(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.onMessageBoxDeclineClick(), this);
    this.AddCallback(
      "msg_box",
      ui_events.MESSAGE_BOX_QUIT_GAME_CLICKED,
      () => this.onQuitGameConfirmButtonClick(),
      this
    );
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_WIN_CLICKED, () => this.onQuitGameButtonClick(), this);
  }

  /**
   * Close main menu.
   */
  public close(): void {
    executeConsoleCommand(consoleCommands.main_menu, "off");
    EventsManager.emitEvent(EGameEvent.MAIN_MENU_OFF);
  }

  /**
   * Clicked message box confirmation.
   */
  public onMessageBoxOkClick(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * Declined message box.
   */
  public onMessageBoxCancelClick(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * Clicked load last save.
   */
  public onLoadLastSaveButtonClick(): void {
    logger.info("Load last save click");

    if (registry.simulator === null) {
      return loadLastGameSave();
    }

    if (!registry.actor?.alive()) {
      return loadLastGameSave();
    }

    // If currently playing game and actor is alive, ask confirmation.
    this.modalBoxMode = EMainMenuModalMode.CONFIRM_LOAD_SAVE;
    this.uiModalBox.InitMessageBox("message_box_confirm_load_save");
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * Clicked credits menu button.
   */
  public onGameCreditsButtonClick(): void {
    game.start_tutorial(gameTutorials.credits_seq);
  }

  /**
   * On click extensions menu item button.
   */
  public onExtensionsButtonClick(): void {
    if (this.uiGameExtensionsDialog === null) {
      this.uiGameExtensionsDialog = new ExtensionsDialog(this);
    }

    this.uiGameExtensionsDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  /**
   * Clicked close game button.
   */
  public onQuitToWindowsButtonClick(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_windows");
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * Clicked disconnect from game.
   */
  public onDisconnectButtonClick(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_game");

    this.uiModalBox.SetText(
      level.game_id() === gameTypes.eGameIDSingle ? "ui_mm_quit_game_message" : "ui_mm_disconnect_message"
    );
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * Clicked confirmation of game quit.
   */
  public onQuitGameConfirmButtonClick(): void {
    executeConsoleCommand(consoleCommands.disconnect);
  }

  /**
   * Clicked quit game button.
   */
  public onQuitGameButtonClick(): void {
    executeConsoleCommand(consoleCommands.quit);
  }

  /**
   * Clicked return to game.
   */
  public onReturnToGameButtonClick(): void {
    this.close();
  }

  /**
   * Clicked save game button.
   */
  public onSaveGameButtonClick(): void {
    if (this.uiGameSavesSaveDialog === null) {
      this.uiGameSavesSaveDialog = new SaveDialog(this);
    }

    this.uiGameSavesSaveDialog.fillList();
    this.uiGameSavesSaveDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * Clicked options button.
   */
  public onOptionsButtonClick(): void {
    if (this.uiGameOptionsDialog === null) {
      this.uiGameOptionsDialog = new OptionsDialog(this);
    }

    this.uiGameOptionsDialog.initializeState();
    this.uiGameOptionsDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  /**
   * Clicked debug button.
   */
  public onDevelopmentDebugButtonClick(): void {
    if (gameConfig.DEBUG.IS_ENABLED) {
      logger.info("Activating debug settings view");
    } else {
      logger.info("Debug settings are disabled");

      return;
    }

    if (this.uiGameDebugDialog === null) {
      this.uiGameDebugDialog = new DebugDialog(this);
    }

    this.uiGameDebugDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  /**
   * On open load games menu click.
   */
  public onLoadGameButtonClick(): void {
    if (this.uiGameSavesLoadDialog === null) {
      this.uiGameSavesLoadDialog = new LoadDialog(this);
    }

    this.uiGameSavesLoadDialog.fillList();
    this.uiGameSavesLoadDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * On network game play clicked.
   */
  public onNetworkGameButtonClick(): void {
    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game);
  }

  /**
   * On multiplayer button click.
   */
  public onMultiplayerButtonClick(): void {
    if (!this.uiMultiplayerMenuDialog) {
      this.uiMultiplayerMenuDialog = new MultiplayerMenu(this, this.xrGameSpyProfile?.online() === true);
      this.uiMultiplayerMenuDialog.onRadioNetChanged();

      if (this.uiMultiplayerMenuDialog.online) {
        this.uiMultiplayerMenuDialog.dialogMultiplayerProfile.InitBestScores();
        this.uiMultiplayerMenuDialog.dialogMultiplayerProfile.fillRewardsTable();
      }
    }

    this.uiMultiplayerMenuDialog.updateControls();
    this.uiMultiplayerMenuDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(consoleCommands.check_for_updates, 0);
  }

  /**
   * On network logout button clicked.
   */
  public onLogoutButtonClick(): void {
    // -- assert(this.gs_profile)

    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
    this.xrLoginManager.logout();

    this.xrGameSpyProfile = null;
    this.uiMultiplayerMenuDialog = null;

    this.xrMenuPageController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main");
    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
  }

  /**
   * On clicked network play button.
   */
  public onInternetButtonClick(): void {
    logger.info("Button internet clicked");

    if (!this.uiGamespyDialog) {
      this.uiGamespyDialog = new MultiplayerGameSpy(this);
    }

    this.uiGamespyDialog.showLoginPage();
    this.uiGamespyDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(consoleCommands.check_for_updates, 0);
  }

  /**
   * On clicked local network play button.
   */
  public onLocalnetButtonClick(): void {
    if (!this.uiLocalnetDialog) {
      this.uiLocalnetDialog = new MultiplayerLocalnet(this);
      this.uiLocalnetDialog.uiLpNickname.SetText(this.xrLoginManager.get_nick_from_registry());
      this.uiLocalnetDialog.uiLpCheckRememberMe.SetCheck(this.xrLoginManager.get_remember_me_from_registry());
    }

    this.uiLocalnetDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(consoleCommands.check_for_updates, 0);
  }

  /**
   * Confirm message box confirmation.
   */
  public onMessageBoxConfirmClick(): void {
    if (this.modalBoxMode === EMainMenuModalMode.CONFIRM_LOAD_SAVE) {
      loadLastGameSave();
    }

    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * Decline message box confirmation.
   */
  public onMessageBoxDeclineClick(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * Show menu magnifier on main menu show.
   */
  public override Show(isVisible: boolean): void {
    this.xrMenuPageController.SetVisibleMagnifier(isVisible);
  }

  /**
   * Handle command dispatch to the component.
   */
  public override Dispatch(command: TNumberId): boolean {
    if (command === 2) {
      this.onMultiplayerButtonClick();
    }

    return true;
  }

  /**
   * Handle keyboard buttons press events.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE: {
          const actor: Optional<ClientObject> = registry.actor;

          if (level.present() && ((actor !== null && actor.alive()) || !IsGameTypeSingle())) {
            this.onReturnToGameButtonClick();
          }

          break;
        }

        case DIK_keys.DIK_F11: {
          this.onDevelopmentDebugButtonClick();
          break;
        }

        case DIK_keys.DIK_Q:
          this.onQuitGameButtonClick();
          break;
      }
    }

    return true;
  }
}
