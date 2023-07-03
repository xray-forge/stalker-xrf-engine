import {
  alife,
  CMainMenu,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIStatic,
  device,
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
import { EventsManager } from "@/engine/core/managers/events/EventsManager";
import { EGameEvent } from "@/engine/core/managers/events/types";
import { DebugDialog } from "@/engine/core/ui/debug/DebugDialog";
import { LoadDialog } from "@/engine/core/ui/menu/load/LoadDialog";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { MultiplayerGameSpy } from "@/engine/core/ui/menu/multiplayer_login/MultiplayerGamespy";
import { MultiplayerLocalnet } from "@/engine/core/ui/menu/multiplayer_login/MultiplayerLocalnet";
import { OptionsDialog } from "@/engine/core/ui/menu/options/OptionsDialog";
import { SaveDialog } from "@/engine/core/ui/menu/save/SaveDialog";
import { executeConsoleCommand } from "@/engine/core/utils/game/game_console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions/captions";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { gameDifficulties, TGameDifficulty } from "@/engine/lib/constants/game_difficulties";
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
 * todo;
 */
@LuabindClass()
export class MainMenu extends CUIScriptWnd {
  public readonly xrAccountManager: AccountManager;
  public readonly xrProfileStore: ProfileStore;
  public readonly xrLoginManager: LoginManager;
  public xrGameSpyProfile: Optional<Profile>;

  public readonly xrMenuController: CMainMenu = main_menu.get_main_menu();
  public xrMenuPageController!: CUIMMShniaga;

  public uiModalBox!: CUIMessageBoxEx;
  public modalBoxMode: EMainMenuModalMode = EMainMenuModalMode.OFF;

  public uiMultiplayerMenuDialog: Optional<MultiplayerMenu> = null;
  public uiGameOptionsDialog: Optional<OptionsDialog> = null;
  public uiGameSavesSaveDialog: Optional<SaveDialog> = null;
  public uiGameSavesLoadDialog: Optional<LoadDialog> = null;
  public uiLocalnetDialog: Optional<MultiplayerLocalnet> = null;
  public uiGamespyDialog: Optional<MultiplayerGameSpy> = null;
  public uiGameDebugDialog: Optional<DebugDialog> = null;

  /**
   * todo: Description.
   */
  public constructor() {
    super();

    this.xrLoginManager = this.xrMenuController.GetLoginMngr();
    this.xrAccountManager = this.xrMenuController.GetAccountMngr();
    this.xrProfileStore = this.xrMenuController.GetProfileStore();
    this.xrGameSpyProfile = this.xrLoginManager.get_current_profile();

    this.initControls();
    this.initCallBacks();

    EventsManager.getInstance().emitEvent(EGameEvent.MAIN_MENU_ON);
  }

  /**
   * todo: Description.
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: CScriptXmlInit = resolveXmlFile(base);

    xml.InitStatic("background", this);

    this.uiModalBox = new CUIMessageBoxEx();
    this.xrMenuPageController = xml.InitMMShniaga("shniaga_wnd", this);

    this.Register(this.uiModalBox, "msg_box");

    const version: CUIStatic = xml.InitStatic("static_version", this);

    version.TextControl().SetText(string.format(gameConfig.VERSION, this.xrMenuController.GetGSVer()));

    if (this.xrGameSpyProfile && !level.present()) {
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
      this.xrMenuPageController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main_logout");
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
    }
  }

  /**
   * todo: Description.
   */
  public initCallBacks(): void {
    this.AddCallback(
      "btn_novice",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(gameDifficulties.gd_novice),
      this
    );
    this.AddCallback(
      "btn_stalker",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(gameDifficulties.gd_stalker),
      this
    );
    this.AddCallback(
      "btn_veteran",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(gameDifficulties.gd_veteran),
      this
    );
    this.AddCallback(
      "btn_master",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(gameDifficulties.gd_master),
      this
    );
    this.AddCallback("btn_options", ui_events.BUTTON_CLICKED, () => this.onButtonClickOptions(), this);
    this.AddCallback("btn_load", ui_events.BUTTON_CLICKED, () => this.onButtonClickLoadGame(), this);
    this.AddCallback("btn_save", ui_events.BUTTON_CLICKED, () => this.onButtonClickSaveGame(), this);

    this.AddCallback("btn_net_game", ui_events.BUTTON_CLICKED, () => this.onButtonClickNetworkGame(), this);
    this.AddCallback("btn_internet", ui_events.BUTTON_CLICKED, () => this.onButtonClickInternet(), this);
    this.AddCallback("btn_localnet", ui_events.BUTTON_CLICKED, () => this.onButtonClickLocalnet(), this);
    this.AddCallback("btn_multiplayer", ui_events.BUTTON_CLICKED, () => this.onButtonClickMultiplayer(), this);
    this.AddCallback("btn_logout", ui_events.BUTTON_CLICKED, () => this.onButtonClickLogout(), this);

    this.AddCallback("btn_quit", ui_events.BUTTON_CLICKED, () => this.onButtonClickQuiteGameToWindows(), this);
    this.AddCallback("btn_quit_to_mm", ui_events.BUTTON_CLICKED, () => this.onButtonClickDisconnect(), this);
    this.AddCallback("btn_ret", ui_events.BUTTON_CLICKED, () => this.onButtonClickReturnToGame(), this);
    this.AddCallback("btn_lastsave", ui_events.BUTTON_CLICKED, () => this.onButtonClickLastSave(), this);
    this.AddCallback("btn_credits", ui_events.BUTTON_CLICKED, () => this.onButtonClickGameCredits(), this);

    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onMessageBoxOk(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_CANCEL_CLICKED, () => this.onMessageBoxCancel(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.onMessageBoxConfirm(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.onMessageBoxDecline(), this);
    this.AddCallback(
      "msg_box",
      ui_events.MESSAGE_BOX_QUIT_GAME_CLICKED,
      () => this.onButtonClickQuitGameConfirm(),
      this
    );
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_WIN_CLICKED, () => this.onButtonClickQuiteGame(), this);
  }

  /**
   * todo: Description.
   */
  public close(): void {
    executeConsoleCommand(consoleCommands.main_menu, "off");
    EventsManager.getInstance().emitEvent(EGameEvent.MAIN_MENU_OFF);
  }

  /**
   * todo: Description.
   */
  public onStartNewGame(difficulty: TGameDifficulty): void {
    executeConsoleCommand(consoleCommands.g_game_difficulty, difficulty);

    if (alife() !== null) {
      executeConsoleCommand(consoleCommands.disconnect);
    }

    device().pause(false);

    executeConsoleCommand(consoleCommands.start, "server(all/single/alife/new)", "client(localhost)");
    executeConsoleCommand(consoleCommands.main_menu, "off");
  }

  /**
   * todo: Description.
   */
  public onMessageBoxOk(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo: Description.
   */
  public onMessageBoxCancel(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo: Description.
   */
  public onLoadLastSavedGame(): void {
    executeConsoleCommand(consoleCommands.main_menu, "off");
    executeConsoleCommand(consoleCommands.load_last_save);
  }

  /**
   * todo: Description.
   */
  public onButtonClickLastSave(): void {
    if (alife() === null) {
      return this.onLoadLastSavedGame();
    }

    if (!registry.actor?.alive()) {
      return this.onLoadLastSavedGame();
    }

    // If currently playing game and actor is alive, ask confirmation.
    this.modalBoxMode = EMainMenuModalMode.CONFIRM_LOAD_SAVE;
    this.uiModalBox.InitMessageBox("message_box_confirm_load_save");
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onButtonClickGameCredits(): void {
    game.start_tutorial(gameTutorials.credits_seq);
  }

  /**
   * todo: Description.
   */
  public onButtonClickQuiteGameToWindows(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_windows");
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onButtonClickDisconnect(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_game");

    this.uiModalBox.SetText(
      level.game_id() === gameTypes.eGameIDSingle ? captions.ui_mm_quit_game_message : captions.ui_mm_disconnect_message
    );
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onButtonClickQuitGameConfirm(): void {
    executeConsoleCommand(consoleCommands.disconnect);
  }

  /**
   * todo: Description.
   */
  public onButtonClickQuiteGame(): void {
    executeConsoleCommand(consoleCommands.quit);
  }

  /**
   * todo: Description.
   */
  public onButtonClickReturnToGame(): void {
    this.close();
  }

  /**
   * todo: Description.
   */
  public onButtonClickSaveGame(): void {
    if (this.uiGameSavesSaveDialog === null) {
      this.uiGameSavesSaveDialog = new SaveDialog(this);
    }

    this.uiGameSavesSaveDialog.fillList();
    this.uiGameSavesSaveDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo: Description.
   */
  public onButtonClickOptions(): void {
    if (this.uiGameOptionsDialog === null) {
      this.uiGameOptionsDialog = new OptionsDialog(this);
    }

    this.uiGameOptionsDialog.initializeState();
    this.uiGameOptionsDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo: Description.
   */
  public onButtonClickDevelopmentDebug(): void {
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
   * todo: Description.
   */
  public onButtonClickLoadGame(): void {
    if (this.uiGameSavesLoadDialog === null) {
      this.uiGameSavesLoadDialog = new LoadDialog(this);
    }

    this.uiGameSavesLoadDialog.fillList();
    this.uiGameSavesLoadDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo: Description.
   */
  public onButtonClickNetworkGame(): void {
    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game);
  }

  /**
   * todo: Description.
   */
  public onButtonClickMultiplayer(): void {
    logger.info("Button multiplayer clicked, profile");

    if (!this.uiMultiplayerMenuDialog) {
      this.uiMultiplayerMenuDialog = new MultiplayerMenu(this, this.xrGameSpyProfile?.online() === true);
      this.uiMultiplayerMenuDialog.onRadioNetChanged();

      if (this.uiMultiplayerMenuDialog.online) {
        this.uiMultiplayerMenuDialog.dialogMultiplayerProfile.InitBestScores();
        this.uiMultiplayerMenuDialog.dialogMultiplayerProfile.fillRewardsTable();
      }
    }

    logger.info("Updating multiplayer menu");

    this.uiMultiplayerMenuDialog.updateControls();
    this.uiMultiplayerMenuDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(consoleCommands.check_for_updates, 0);
  }

  /**
   * todo: Description.
   */
  public onButtonClickLogout(): void {
    // -- assert(this.gs_profile)

    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
    this.xrLoginManager.logout();

    this.xrGameSpyProfile = null;
    this.uiMultiplayerMenuDialog = null;

    this.xrMenuPageController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main");
    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
  }

  /**
   * todo: Description.
   */
  public onButtonClickInternet(): void {
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
   * todo: Description.
   */
  public onButtonClickLocalnet(): void {
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
   * todo: Description.
   */
  public onMessageBoxConfirm(): void {
    if (this.modalBoxMode === EMainMenuModalMode.CONFIRM_LOAD_SAVE) {
      this.onLoadLastSavedGame();
    }

    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo: Description.
   */
  public onMessageBoxDecline(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo: Description.
   */
  public override Show(isVisible: boolean): void {
    this.xrMenuPageController.SetVisibleMagnifier(isVisible);
  }

  /**
   * todo: Description.
   */
  public override Dispatch(command: TNumberId): boolean {
    if (command === 2) {
      this.onButtonClickMultiplayer();
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE: {
          const actor: Optional<ClientObject> = registry.actor;

          if (level.present() && ((actor !== null && actor.alive()) || !IsGameTypeSingle())) {
            this.onButtonClickReturnToGame();
          }

          break;
        }

        case DIK_keys.DIK_F11: {
          this.onButtonClickDevelopmentDebug();
          break;
        }

        case DIK_keys.DIK_Q:
          this.onButtonClickQuiteGame();
          break;
      }
    }

    return true;
  }
}
