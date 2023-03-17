import {
  alife,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  device,
  DIK_keys,
  Frect,
  game,
  IsGameTypeSingle,
  level,
  LuabindClass,
  main_menu,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_account_manager,
  XR_CMainMenu,
  XR_CScriptXmlInit,
  XR_CUIMessageBoxEx,
  XR_CUIMMShniaga,
  XR_CUIStatic,
  XR_game_object,
  XR_login_manager,
  XR_profile,
  XR_profile_store,
} from "xray16";

import { captions } from "@/engine/globals/captions";
import { console_commands } from "@/engine/globals/console_commands";
import { game_difficulties, TGameDifficulty } from "@/engine/globals/game_difficulties";
import { game_tutorials } from "@/engine/globals/game_tutorials";
import { game_types } from "@/engine/globals/game_types";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional, TNumberId } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { EGameEvent } from "@/engine/scripts/core/managers/events/EGameEvent";
import { EventsManager } from "@/engine/scripts/core/managers/events/EventsManager";
import { DebugDialog } from "@/engine/scripts/core/ui/debug/DebugDialog";
import { LoadDialog } from "@/engine/scripts/core/ui/menu/load/LoadDialog";
import { MultiplayerMenu } from "@/engine/scripts/core/ui/menu/multiplayer/MultiplayerMenu";
import { MultiplayerGameSpy } from "@/engine/scripts/core/ui/menu/multiplayer_login/MultiplayerGamespy";
import { MultiplayerLocalnet } from "@/engine/scripts/core/ui/menu/multiplayer_login/MultiplayerLocalnet";
import { OptionsDialog } from "@/engine/scripts/core/ui/menu/options/OptionsDialog";
import { SaveDialog } from "@/engine/scripts/core/ui/menu/save/SaveDialog";
import { executeConsoleCommand } from "@/engine/scripts/utils/console";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { resolveXmlFile, resolveXmlFormPath } from "@/engine/scripts/utils/ui";

export const base: string = "menu\\MainMenu.component";
const logger: LuaLogger = new LuaLogger($filename);

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
  public readonly xrAccountManager: XR_account_manager;
  public readonly xrProfileStore: XR_profile_store;
  public readonly xrLoginManager: XR_login_manager;
  public xrGameSpyProfile: Optional<XR_profile>;

  public readonly xrMenuController: XR_CMainMenu = main_menu.get_main_menu();
  public xrMenuPageController!: XR_CUIMMShniaga;

  public uiModalBox!: XR_CUIMessageBoxEx;
  public modalBoxMode: EMainMenuModalMode = EMainMenuModalMode.OFF;

  public uiMultiplayerMenuDialog: Optional<MultiplayerMenu> = null;
  public uiGameOptionsDialog: Optional<OptionsDialog> = null;
  public uiGameSavesSaveDialog: Optional<SaveDialog> = null;
  public uiGameSavesLoadDialog: Optional<LoadDialog> = null;
  public uiLocalnetDialog: Optional<MultiplayerLocalnet> = null;
  public uiGamespyDialog: Optional<MultiplayerGameSpy> = null;
  public uiGameDebugDialog: Optional<DebugDialog> = null;

  /**
   * todo;
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
   * todo;
   */
  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = resolveXmlFile(base);

    xml.InitStatic("background", this);

    this.uiModalBox = new CUIMessageBoxEx();
    this.xrMenuPageController = xml.InitMMShniaga("shniaga_wnd", this);

    this.Register(this.uiModalBox, "msg_box");

    const version: XR_CUIStatic = xml.InitStatic("static_version", this);

    version.TextControl().SetText(string.format(gameConfig.VERSION, this.xrMenuController.GetGSVer()));

    if (this.xrGameSpyProfile && !level.present()) {
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
      this.xrMenuPageController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main_logout");
      this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
    }
  }

  /**
   * todo;
   */
  public initCallBacks(): void {
    this.AddCallback(
      "btn_novice",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(game_difficulties.gd_novice),
      this
    );
    this.AddCallback(
      "btn_stalker",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(game_difficulties.gd_stalker),
      this
    );
    this.AddCallback(
      "btn_veteran",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(game_difficulties.gd_veteran),
      this
    );
    this.AddCallback(
      "btn_master",
      ui_events.BUTTON_CLICKED,
      () => this.onStartNewGame(game_difficulties.gd_master),
      this
    );
    this.AddCallback("btn_options", ui_events.BUTTON_CLICKED, () => this.onButtonClickOptions(), this);
    this.AddCallback("btn_debug_tools", ui_events.BUTTON_CLICKED, () => this.onButtonClickDevelopmentDebug(), this);
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
   * todo;
   */
  public onStartNewGame(difficulty: TGameDifficulty): void {
    executeConsoleCommand(console_commands.g_game_difficulty, difficulty);

    if (alife() !== null) {
      executeConsoleCommand(console_commands.disconnect);
    }

    device().pause(false);

    executeConsoleCommand(console_commands.start, "server(all/single/alife/new)", "client(localhost)");
    executeConsoleCommand(console_commands.main_menu, "off");
  }

  /**
   * todo;
   */
  public onMessageBoxOk(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo;
   */
  public onMessageBoxCancel(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo;
   */
  public onLoadLastSavedGame(): void {
    executeConsoleCommand(console_commands.main_menu, "off");
    executeConsoleCommand(console_commands.load_last_save);
  }

  /**
   * todo;
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
   * todo;
   */
  public onButtonClickGameCredits(): void {
    game.start_tutorial(game_tutorials.credits_seq);
  }

  /**
   * todo;
   */
  public onButtonClickQuiteGameToWindows(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_windows");
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * todo;
   */
  public onButtonClickDisconnect(): void {
    this.uiModalBox.InitMessageBox("message_box_quit_game");

    this.uiModalBox.SetText(
      level.game_id() === game_types.eGameIDSingle
        ? captions.ui_mm_quit_game_message
        : captions.ui_mm_disconnect_message
    );
    this.uiModalBox.ShowDialog(true);
  }

  /**
   * todo;
   */
  public onButtonClickQuitGameConfirm(): void {
    executeConsoleCommand(console_commands.disconnect);
  }

  /**
   * todo;
   */
  public onButtonClickQuiteGame(): void {
    executeConsoleCommand(console_commands.quit);
  }

  /**
   * todo;
   */
  public onButtonClickReturnToGame(): void {
    executeConsoleCommand(console_commands.main_menu, "off");
    EventsManager.getInstance().emitEvent(EGameEvent.MAIN_MENU_OFF);
  }

  /**
   * todo;
   */
  public onButtonClickSaveGame(): void {
    if (this.uiGameSavesSaveDialog === null) {
      this.uiGameSavesSaveDialog = new SaveDialog(this);
    }

    this.uiGameSavesSaveDialog.FillList();
    this.uiGameSavesSaveDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo;
   */
  public onButtonClickOptions(): void {
    if (this.uiGameOptionsDialog === null) {
      this.uiGameOptionsDialog = new OptionsDialog(this);
    }

    this.uiGameOptionsDialog.SetCurrentValues();
    this.uiGameOptionsDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo;
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
   * todo;
   */
  public onButtonClickLoadGame(): void {
    if (this.uiGameSavesLoadDialog === null) {
      this.uiGameSavesLoadDialog = new LoadDialog(this);
    }

    this.uiGameSavesLoadDialog.FillList();
    this.uiGameSavesLoadDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  /**
   * todo;
   */
  public onButtonClickNetworkGame(): void {
    this.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game);
  }

  /**
   * todo;
   */
  public onButtonClickMultiplayer(): void {
    logger.info("Button multiplayer clicked, profile");

    if (!this.uiMultiplayerMenuDialog) {
      this.uiMultiplayerMenuDialog = new MultiplayerMenu(this, this.xrGameSpyProfile?.online() === true);
      this.uiMultiplayerMenuDialog.OnRadio_NetChanged();

      if (this.uiMultiplayerMenuDialog.online) {
        this.uiMultiplayerMenuDialog.dlg_profile.InitBestScores();
        this.uiMultiplayerMenuDialog.dlg_profile.FillRewardsTable();
      }
    }

    logger.info("Updating multiplayer menu");

    this.uiMultiplayerMenuDialog.UpdateControls();
    this.uiMultiplayerMenuDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(console_commands.check_for_updates, 0);
  }

  /**
   * todo;
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
   * todo;
   */
  public onButtonClickInternet(): void {
    logger.info("Button internet clicked");

    if (!this.uiGamespyDialog) {
      this.uiGamespyDialog = new MultiplayerGameSpy(this);
    }

    this.uiGamespyDialog.ShowLoginPage();
    this.uiGamespyDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(console_commands.check_for_updates, 0);
  }

  /**
   * todo;
   */
  public onButtonClickLocalnet(): void {
    if (!this.uiLocalnetDialog) {
      this.uiLocalnetDialog = new MultiplayerLocalnet(this);
      this.uiLocalnetDialog.lp_nickname.SetText(this.xrLoginManager.get_nick_from_registry());
      this.uiLocalnetDialog.lp_check_remember_me.SetCheck(this.xrLoginManager.get_remember_me_from_registry());
    }

    this.uiLocalnetDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    executeConsoleCommand(console_commands.check_for_updates, 0);
  }

  /**
   * todo;
   */
  public onMessageBoxConfirm(): void {
    if (this.modalBoxMode === EMainMenuModalMode.CONFIRM_LOAD_SAVE) {
      this.onLoadLastSavedGame();
    }

    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo;
   */
  public onMessageBoxDecline(): void {
    this.modalBoxMode = EMainMenuModalMode.OFF;
  }

  /**
   * todo;
   */
  public override Show(isVisible: boolean): void {
    this.xrMenuPageController.SetVisibleMagnifier(isVisible);
  }

  /**
   * todo;
   */
  public override Dispatch(command: TNumberId): boolean {
    if (command === 2) {
      this.onButtonClickMultiplayer();
    }

    return true;
  }

  /**
   * todo;
   */
  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE: {
          const actor: Optional<XR_game_object> = registry.actor;

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
