import {
  alife,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  device,
  DIK_keys,
  Frect,
  game,
  get_console,
  IsGameTypeSingle,
  level,
  main_menu,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_account_manager,
  XR_CConsole,
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

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { EGameEvent } from "@/mod/scripts/core/managers/events/EGameEvent";
import { EventsManager } from "@/mod/scripts/core/managers/events/EventsManager";
import { DebugDialog, IDebugDialog } from "@/mod/scripts/ui/debug/DebugDialog";
import { ILoadDialog, LoadDialog } from "@/mod/scripts/ui/menu/LoadDialog";
import { IMultiplayerGameSpy, MultiplayerGameSpy } from "@/mod/scripts/ui/menu/multiplayer/MultiplayerGamespy";
import { IMultiplayerLocalnet, MultiplayerLocalnet } from "@/mod/scripts/ui/menu/multiplayer/MultiplayerLocalnet";
import { IMultiplayerMenu, MultiplayerMenu } from "@/mod/scripts/ui/menu/MultiplayerMenu";
import { IOptionsDialog, OptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";
import { ISaveDialog, SaveDialog } from "@/mod/scripts/ui/menu/SaveDialog";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";

export const base: string = "menu\\MainMenu.component";
const logger: LuaLogger = new LuaLogger("MainMenu");

@LuabindClass()
export class MainMenu extends CUIScriptWnd {
  public readonly xrMainMenu: XR_CMainMenu = main_menu.get_main_menu();
  public readonly accountManager: XR_account_manager;
  public readonly profile_store: XR_profile_store;
  public readonly loginManager: XR_login_manager;
  public gameSpyProfile: Optional<XR_profile>;

  public menuController!: XR_CUIMMShniaga;
  public modalBox!: XR_CUIMessageBoxEx;
  public modalBoxMode: number = 0;

  public multiplayerMenuDialog: Optional<IMultiplayerMenu> = null;
  public gameOptionsDialog: Optional<IOptionsDialog> = null;
  public gameSavesSaveDialog: Optional<ISaveDialog> = null;
  public gameSavesLoadDialog: Optional<ILoadDialog> = null;
  public localnetDialog: Optional<IMultiplayerLocalnet> = null;
  public gamespyDialog: Optional<IMultiplayerGameSpy> = null;
  public gameDebugDialog: Optional<IDebugDialog> = null;

  public constructor() {
    super();

    this.loginManager = this.xrMainMenu.GetLoginMngr();
    this.accountManager = this.xrMainMenu.GetAccountMngr();
    this.profile_store = this.xrMainMenu.GetProfileStore();
    this.gameSpyProfile = this.loginManager.get_current_profile();

    this.initControls();
    this.initCallBacks();

    EventsManager.getInstance().emitEvent(EGameEvent.MAIN_MENU_ON);
  }

  public initControls(): void {
    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));
    xml.InitStatic("background", this);

    this.modalBox = new CUIMessageBoxEx();
    this.menuController = xml.InitMMShniaga("shniaga_wnd", this);

    this.Register(this.modalBox, "msg_box");

    const version: XR_CUIStatic = xml.InitStatic("static_version", this);

    version.TextControl().SetText(string.format(gameConfig.VERSION, this.xrMainMenu.GetGSVer()));

    if (this.gameSpyProfile && !level.present()) {
      this.menuController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
      this.menuController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main_logout");
      this.menuController.ShowPage(CUIMMShniaga.epi_main);
    }
  }

  public initCallBacks(): void {
    // -- new game
    this.AddCallback("btn_novice", ui_events.BUTTON_CLICKED, () => this.OnButton_new_novice_game(), this);
    this.AddCallback("btn_stalker", ui_events.BUTTON_CLICKED, () => this.OnButton_new_stalker_game(), this);
    this.AddCallback("btn_veteran", ui_events.BUTTON_CLICKED, () => this.OnButton_new_veteran_game(), this);
    this.AddCallback("btn_master", ui_events.BUTTON_CLICKED, () => this.OnButton_new_master_game(), this);
    // -- options
    this.AddCallback("btn_options", ui_events.BUTTON_CLICKED, () => this.OnButton_options_clicked(), this);
    // -- debug
    this.AddCallback("btn_debug_tools", ui_events.BUTTON_CLICKED, () => this.OnButton_dev_debug_dialog(), this);
    // -- load
    this.AddCallback("btn_load", ui_events.BUTTON_CLICKED, () => this.OnButton_load_clicked(), this);
    // -- save
    this.AddCallback("btn_save", ui_events.BUTTON_CLICKED, () => this.OnButton_save_clicked(), this);
    // -- multiplayer

    this.AddCallback("btn_net_game", ui_events.BUTTON_CLICKED, () => this.OnButton_network_game_clicked(), this);
    this.AddCallback("btn_internet", ui_events.BUTTON_CLICKED, () => this.OnButton_internet_clicked(), this);
    this.AddCallback("btn_localnet", ui_events.BUTTON_CLICKED, () => this.OnButton_localnet_clicked(), this);
    this.AddCallback("btn_multiplayer", ui_events.BUTTON_CLICKED, () => this.OnButton_multiplayer_clicked(), this);
    this.AddCallback("btn_logout", ui_events.BUTTON_CLICKED, () => this.OnButton_logout_clicked(), this);

    // -- quit
    this.AddCallback("btn_quit", ui_events.BUTTON_CLICKED, () => this.OnButton_quit_clicked(), this);
    this.AddCallback("btn_quit_to_mm", ui_events.BUTTON_CLICKED, () => this.OnButton_disconnect_clicked(), this);
    this.AddCallback("btn_ret", ui_events.BUTTON_CLICKED, () => this.onButtonReturnToGameClick(), this);
    this.AddCallback("btn_lastsave", ui_events.BUTTON_CLICKED, () => this.OnButton_last_save(), this);
    this.AddCallback("btn_credits", ui_events.BUTTON_CLICKED, () => this.OnButton_credits_clicked(), this);

    // -- message box
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_CANCEL_CLICKED, () => this.OnMsgCancel(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.OnMsgNo(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_GAME_CLICKED, () => this.OnMessageQuitGame(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_WIN_CLICKED, () => this.OnMessageQuitWin(), this);
  }

  public Show(value: boolean): void {
    logger.info("Show:", value);
    this.menuController.SetVisibleMagnifier(value);
  }

  public OnMsgOk(): void {
    logger.info("Message OK clicked");
    this.modalBoxMode = 0;
  }

  public OnMsgCancel(): void {
    logger.info("Message cancel clicked");
    this.modalBoxMode = 0;
  }

  public OnMsgYes(): void {
    if (this.modalBoxMode === 1) {
      this.LoadLastSave();
    }

    this.modalBoxMode = 0;
  }

  public OnMsgNo(): void {
    this.modalBoxMode = 0;
  }

  public LoadLastSave(): void {
    const console: XR_CConsole = get_console();

    console.execute("main_menu off");
    console.execute("load_last_save");
  }

  public OnButton_last_save(): void {
    if (alife() === null) {
      this.LoadLastSave();

      return;
    }

    const actor: Optional<XR_game_object> = registry.actor;

    if (actor !== null && !actor.alive()) {
      this.LoadLastSave();

      return;
    }

    this.modalBoxMode = 1;
    this.modalBox.InitMessageBox("message_box_confirm_load_save");
    this.modalBox.ShowDialog(true);
  }

  public OnButton_credits_clicked(): void {
    // --  local console = get_console()
    // --  console.execute("main_menu off")
    game.start_tutorial("credits_seq");
  }

  public OnButton_quit_clicked(): void {
    this.modalBox.InitMessageBox("message_box_quit_windows");
    this.modalBox.ShowDialog(true);
  }

  public OnButton_disconnect_clicked(): void {
    this.modalBox.InitMessageBox("message_box_quit_game");

    if (level.game_id() !== 1) {
      this.modalBox.SetText("ui_mm_disconnect_message"); // -- MultiPlayer
    } else {
      this.modalBox.SetText("ui_mm_quit_game_message"); //  -- SinglePlayer
    }

    this.modalBox.ShowDialog(true);
  }

  public OnMessageQuitGame(): void {
    get_console().execute("disconnect");
  }

  public OnMessageQuitWin(): void {
    get_console().execute("quit");
  }

  public onButtonReturnToGameClick(): void {
    logger.info("Return to game");

    get_console().execute("main_menu off");
    EventsManager.getInstance().emitEvent(EGameEvent.MAIN_MENU_OFF);
  }

  public OnButton_new_novice_game(): void {
    get_console().execute("g_game_difficulty gd_novice");
    this.StartGame();
  }

  public OnButton_new_stalker_game(): void {
    get_console().execute("g_game_difficulty gd_stalker");
    this.StartGame();
  }

  public OnButton_new_veteran_game(): void {
    get_console().execute("g_game_difficulty gd_veteran");
    this.StartGame();
  }

  public OnButton_new_master_game(): void {
    get_console().execute("g_game_difficulty gd_master");
    this.StartGame();
  }

  public StartGame(): void {
    const console: XR_CConsole = get_console();

    if (alife() !== null) {
      console.execute("disconnect");
    }

    device().pause(false);

    console.execute("start server(all/single/alife/new) client(localhost)");
    console.execute("main_menu off");
  }

  public OnButton_save_clicked(): void {
    if (this.gameSavesSaveDialog === null) {
      this.gameSavesSaveDialog = create_xr_class_instance(SaveDialog);
      this.gameSavesSaveDialog.owner = this;
    }

    this.gameSavesSaveDialog.FillList();
    this.gameSavesSaveDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  public OnButton_options_clicked(): void {
    logger.info("Activating options view");

    if (this.gameOptionsDialog === null) {
      this.gameOptionsDialog = create_xr_class_instance(OptionsDialog);
      this.gameOptionsDialog.owner = this;
    }

    this.gameOptionsDialog.SetCurrentValues();
    this.gameOptionsDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  public OnButton_dev_debug_dialog(): void {
    if (gameConfig.DEBUG.IS_ENABLED) {
      logger.info("Activating debug settings view");
    } else {
      logger.info("Debug settings are disabled");

      return;
    }

    if (this.gameDebugDialog === null) {
      this.gameDebugDialog = create_xr_class_instance(DebugDialog);
      this.gameDebugDialog.owner = this;
    }

    this.gameDebugDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  }

  public OnButton_load_clicked(): void {
    if (this.gameSavesLoadDialog === null) {
      this.gameSavesLoadDialog = create_xr_class_instance(LoadDialog);
      this.gameSavesLoadDialog.owner = this;
    }

    this.gameSavesLoadDialog.FillList();
    this.gameSavesLoadDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  }

  public OnButton_network_game_clicked(): void {
    this.menuController.ShowPage(CUIMMShniaga.epi_new_network_game);
  }

  public OnButton_multiplayer_clicked(): void {
    logger.info("Button multiplayer clicked, profile");

    // -- assert(this.gs_profile)

    if (!this.multiplayerMenuDialog) {
      this.multiplayerMenuDialog = create_xr_class_instance(MultiplayerMenu, this.gameSpyProfile!.online());
      this.multiplayerMenuDialog.owner = this;
      this.multiplayerMenuDialog.OnRadio_NetChanged();

      if (this.multiplayerMenuDialog.online) {
        this.multiplayerMenuDialog.dlg_profile.InitBestScores();
        this.multiplayerMenuDialog.dlg_profile.FillRewardsTable();
      }
    }

    logger.info("Updating multiplayer menu");

    this.multiplayerMenuDialog.UpdateControls();
    this.multiplayerMenuDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    get_console().execute("check_for_updates 0");
  }

  public OnButton_logout_clicked(): void {
    logger.info("Logout clicked, log out of profiles");

    // -- assert(this.gs_profile)

    this.menuController.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
    this.loginManager.logout();

    this.gameSpyProfile = null;
    this.multiplayerMenuDialog = null;

    this.menuController.SetPage(CUIMMShniaga.epi_main, resolveXmlFormPath(base), "menu_main");
    this.menuController.ShowPage(CUIMMShniaga.epi_main);
  }

  public OnButton_internet_clicked(): void {
    logger.info("Button internet clicked");

    if (!this.gamespyDialog) {
      this.gamespyDialog = create_xr_class_instance(MultiplayerGameSpy);
      this.gamespyDialog.owner = this;
    }

    this.gamespyDialog.ShowLoginPage();
    this.gamespyDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    get_console().execute("check_for_updates 0");
  }

  public OnButton_localnet_clicked(): void {
    if (!this.localnetDialog) {
      this.localnetDialog = create_xr_class_instance(MultiplayerLocalnet);
      this.localnetDialog.owner = this;
      this.localnetDialog.lp_nickname.SetText(this.loginManager.get_nick_from_registry());
      this.localnetDialog.lp_check_remember_me.SetCheck(this.loginManager.get_remember_me_from_registry());
    }

    this.localnetDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    get_console().execute("check_for_updates 0");
  }

  public Dispatch(cmd: number, param: number): boolean {
    if (cmd === 2) {
      this.OnButton_multiplayer_clicked();
    }

    return true;
  }

  public OnKeyboard(dik: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(dik, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (dik === DIK_keys.DIK_ESCAPE) {
        const actor: Optional<XR_game_object> = registry.actor;

        if (level.present() && ((actor !== null && actor.alive()) || IsGameTypeSingle() === false)) {
          this.onButtonReturnToGameClick();
        }
      } else if (dik === DIK_keys.DIK_F11) {
        this.OnButton_dev_debug_dialog();
      } else if (dik === DIK_keys.DIK_Q) {
        this.OnMessageQuitWin();
      }
    }

    return true;
  }
}
