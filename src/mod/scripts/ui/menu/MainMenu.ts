import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { DevDebugDialog, IDevDebugDialog } from "@/mod/scripts/ui/debug/DevDebugDialog";
import { ILoadDialog, LoadDialog } from "@/mod/scripts/ui/menu/LoadDialog";
import { IOptionsDialog, OptionsDialog } from "@/mod/scripts/ui/menu/OptionsDialog";
import { ISaveDialog, SaveDialog } from "@/mod/scripts/ui/menu/SaveDialog";

const base: string = "menu/MainMenu.component.xml";
const log: DebugLogger = new DebugLogger("MainMenu");

export interface IMainMenu extends XR_CUIScriptWnd {
  shniaga: XR_CUIMMShniaga;

  modalBoxMode: number;

  gameOptionsDialog: IOptionsDialog;
  gameSavesSaveDialog: ISaveDialog;
  gameSavesLoadDialog: ILoadDialog;
  ln_dlg: any;
  gs_dlg: any;
  mp_dlg: any;

  gameDevDebugDialog: Optional<IDevDebugDialog>;

  message_box: XR_CUIMessageBoxEx;
  accountManager: XR_account_manager;
  profile_store: XR_profile_store;
  gameSpyProfile: Optional<XR_profile>;

  loginManager: XR_login_manager;

  InitControls(): void;
  InitCallBacks(): void;

  OnMsgOk(): void;
  OnMsgCancel(): void;
  OnMsgYes(): void;
  OnMsgNo(): void;
  LoadLastSave(): void;
  OnButton_last_save(): void;
  OnButton_credits_clicked(): void;
  OnButton_quit_clicked(): void;
  OnButton_disconnect_clicked(): void;
  OnMessageQuitGame(): void;
  OnMessageQuitWin(): void;
  OnButton_return_game(): void;
  OnButton_new_novice_game(): void;
  OnButton_new_stalker_game(): void;
  OnButton_new_veteran_game(): void;
  OnButton_new_master_game(): void;
  StartGame(): void;
  OnButton_save_clicked(): void;
  OnButton_options_clicked(): void;
  OnButton_dev_debug_dialog(): void;
  OnButton_load_clicked(): void;
  OnButton_network_game_clicked(): void;
  OnButton_multiplayer_clicked(): void;
  OnButton_logout_clicked(): void;
  OnButton_internet_clicked(): void;
  OnButton_localnet_clicked(): void;
}

export const MainMenu: IMainMenu = declare_xr_class("MainMenu", CUIScriptWnd, {
  __init(this: IMainMenu): void {
    xr_class_super();

    log.info("Init");

    this.modalBoxMode = 0;

    this.InitControls();
    this.InitCallBacks();

    get_global("xr_s").on_main_menu_on();
  },
  __finalize(): void {},
  InitControls(): void {
    log.info("Init controls");

    this.SetWndRect(new Frect().set(0, 0, gameConfig.UI.BASE_WIDTH, gameConfig.UI.BASE_HEIGHT));

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(base);
    xml.InitStatic("background", this);

    this.shniaga = xml.InitMMShniaga("shniaga_wnd", this);

    this.message_box = new CUIMessageBoxEx();
    this.Register(this.message_box, "msg_box");

    const version: XR_CUIStatic = xml.InitStatic("static_version", this);
    const xrMainMenu: XR_CMainMenu = main_menu.get_main_menu();

    version.TextControl().SetText(lua_string.format(gameConfig.VERSION, xrMainMenu.GetGSVer()));

    this.loginManager = xrMainMenu.GetLoginMngr();
    this.accountManager = xrMainMenu.GetAccountMngr();
    this.profile_store = xrMainMenu.GetProfileStore();
    this.gameSpyProfile = this.loginManager.get_current_profile();

    if (this.gameSpyProfile && !level.present()) {
      this.shniaga.ShowPage(CUIMMShniaga.epi_new_network_game);
      this.shniaga.SetPage(CUIMMShniaga.epi_main, "ui_mm_main.xml", "menu_main_logout");
      this.shniaga.ShowPage(CUIMMShniaga.epi_main);
    }
  },
  InitCallBacks(): void {
    log.info("Init callbacks");

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
    this.AddCallback("btn_ret", ui_events.BUTTON_CLICKED, () => this.OnButton_return_game(), this);
    this.AddCallback("btn_lastsave", ui_events.BUTTON_CLICKED, () => this.OnButton_last_save(), this);
    this.AddCallback("btn_credits", ui_events.BUTTON_CLICKED, () => this.OnButton_credits_clicked(), this);

    // -- message box
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_CANCEL_CLICKED, () => this.OnMsgCancel(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_YES_CLICKED, () => this.OnMsgYes(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_NO_CLICKED, () => this.OnMsgNo(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_GAME_CLICKED, () => this.OnMessageQuitGame(), this);
    this.AddCallback("msg_box", ui_events.MESSAGE_BOX_QUIT_WIN_CLICKED, () => this.OnMessageQuitWin(), this);
  },
  Show(value: boolean): void {
    log.info("Show");
    this.shniaga.SetVisibleMagnifier(value);
  },
  OnMsgOk(): void {
    log.info("Message OK clicked");
    this.modalBoxMode = 0;
  },
  OnMsgCancel(): void {
    log.info("Message cancel clicked");
    this.modalBoxMode = 0;
  },
  OnMsgYes(): void {
    if (this.modalBoxMode === 1) {
      this.LoadLastSave();
    }

    this.modalBoxMode = 0;
  },
  OnMsgNo(): void {
    this.modalBoxMode = 0;
  },
  LoadLastSave(): void {
    const console: XR_CConsole = get_console();

    console.execute("main_menu off");
    console.execute("load_last_save");
  },
  OnButton_last_save(): void {
    if (alife() === null) {
      this.LoadLastSave();

      return;
    }

    const actor = get_global("db").actor;

    if (actor !== null && actor.alive() === false) {
      this.LoadLastSave();

      return;
    }

    this.modalBoxMode = 1;
    this.message_box.InitMessageBox("message_box_confirm_load_save");
    this.message_box.ShowDialog(true);
  },
  OnButton_credits_clicked(): void {
    // --  local console = get_console()
    // --  console.execute("main_menu off")
    game.start_tutorial("credits_seq");
  },
  OnButton_quit_clicked(): void {
    this.message_box.InitMessageBox("message_box_quit_windows");
    this.message_box.ShowDialog(true);
  },
  OnButton_disconnect_clicked(): void {
    this.message_box.InitMessageBox("message_box_quit_game");

    if (level.game_id() != 1) {
      this.message_box.SetText("ui_mm_disconnect_message"); // -- MultiPlayer
    } else {
      this.message_box.SetText("ui_mm_quit_game_message"); //  -- SinglePlayer
    }

    this.message_box.ShowDialog(true);
  },
  OnMessageQuitGame(): void {
    const console: XR_CConsole = get_console();

    console.execute("disconnect");
  },
  OnMessageQuitWin(): void {
    const console: XR_CConsole = get_console();

    console.execute("quit");
  },
  OnButton_return_game(): void {
    log.info("Return to game");

    const console: XR_CConsole = get_console();

    console.execute("main_menu off");
    get_global("xr_s").on_main_menu_off(); //          --' Distemper 03.2008 --
  },
  OnButton_new_novice_game(): void {
    const console: XR_CConsole = get_console();

    console.execute("g_game_difficulty gd_novice");
    this.StartGame();
  },
  OnButton_new_stalker_game(): void {
    const console: XR_CConsole = get_console();

    console.execute("g_game_difficulty gd_stalker");
    this.StartGame();
  },
  OnButton_new_veteran_game(): void {
    const console: XR_CConsole = get_console();

    console.execute("g_game_difficulty gd_veteran");
    this.StartGame();
  },
  OnButton_new_master_game(): void {
    const console: XR_CConsole = get_console();

    console.execute("g_game_difficulty gd_master");
    this.StartGame();
  },
  StartGame(): void {
    const console: XR_CConsole = get_console();

    if (alife() !== null) {
      console.execute("disconnect");
    }

    device().pause(false);

    console.execute("start server(all/single/alife/new) client(localhost)");
    console.execute("main_menu off");
  },
  OnButton_save_clicked(): void {
    if (this.gameSavesSaveDialog === null) {
      this.gameSavesSaveDialog = create_xr_class_instance(SaveDialog);
      this.gameSavesSaveDialog.owner = this;
    }

    this.gameSavesSaveDialog.FillList();
    this.gameSavesSaveDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  },
  OnButton_options_clicked(): void {
    log.info("Activating options view");

    if (this.gameOptionsDialog == null) {
      this.gameOptionsDialog = create_xr_class_instance(OptionsDialog);
      this.gameOptionsDialog.owner = this;
    }

    this.gameOptionsDialog.SetCurrentValues();
    this.gameOptionsDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  },
  OnButton_dev_debug_dialog(): void {
    log.info("Activating debug settings view");

    if (this.gameDevDebugDialog == null) {
      this.gameDevDebugDialog = create_xr_class_instance(DevDebugDialog);
      this.gameDevDebugDialog.owner = this;
    }

    this.gameDevDebugDialog.ShowDialog(true);

    this.HideDialog();
    this.Show(false);
  },
  OnButton_load_clicked(): void {
    if (this.gameSavesLoadDialog === null) {
      this.gameSavesLoadDialog = create_xr_class_instance(LoadDialog);
      this.gameSavesLoadDialog.owner = this;
    }

    this.gameSavesLoadDialog.FillList();
    this.gameSavesLoadDialog.ShowDialog(true);
    this.HideDialog();
    this.Show(false);
  },
  OnButton_network_game_clicked(): void {
    this.shniaga.ShowPage(CUIMMShniaga.epi_new_network_game);
  },
  OnButton_multiplayer_clicked(): void {
    // -- assert(this.gs_profile)

    if (!this.mp_dlg) {
      this.mp_dlg = get_global("ui_mp_main").mp_main(this.gameSpyProfile!.online());
      this.mp_dlg.owner = this;
      this.mp_dlg.OnRadio_NetChanged();

      if (this.mp_dlg.online) {
        this.mp_dlg.dlg_profile.InitBestScores();
        this.mp_dlg.dlg_profile.FillRewardsTable();
      }
    }

    this.mp_dlg.UpdateControls();
    this.mp_dlg.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    const console: XR_CConsole = get_console();

    console.execute("check_for_updates 0");
  },
  OnButton_logout_clicked(): void {
    // -- assert(this.gs_profile)

    this.shniaga.ShowPage(CUIMMShniaga.epi_new_network_game); // --fake
    this.loginManager.logout();
    this.gameSpyProfile = null;
    this.mp_dlg = null;
    this.shniaga.SetPage(CUIMMShniaga.epi_main, "ui_mm_main.xml", "menu_main");
    this.shniaga.ShowPage(CUIMMShniaga.epi_main);
  },
  OnButton_internet_clicked(): void {
    if (!this.gs_dlg) {
      this.gs_dlg = get_global("ui_mm_mp_gamespy").gamespy_page();
      this.gs_dlg.owner = this;
    }

    this.gs_dlg.ShowLoginPage();
    this.gs_dlg.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    const console: XR_CConsole = get_console();

    console.execute("check_for_updates 0");
  },
  OnButton_localnet_clicked(): void {
    if (!this.ln_dlg) {
      this.ln_dlg = get_global("ui_mm_mp_localnet").localnet_page();
      this.ln_dlg.owner = this;
      this.ln_dlg.lp_nickname.SetText(this.loginManager.get_nick_from_registry());
      this.ln_dlg.lp_check_remember_me.SetCheck(this.loginManager.get_remember_me_from_registry());
    }

    this.ln_dlg.ShowDialog(true);

    this.HideDialog();
    this.Show(false);

    const console: XR_CConsole = get_console();

    console.execute("check_for_updates 0");
  },
  Dispatch(cmd: number, param: number): boolean {
    if (cmd == 2) {
      this.OnButton_multiplayer_clicked();
    }

    return true;
  },
  OnKeyboard(dik: TXR_DIK_key, event: TXR_ui_event): boolean {
    CUIScriptWnd.OnKeyboard(this, dik, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (dik === DIK_keys.DIK_ESCAPE) {
        const actor = get_global("db").actor;

        if (level.present() && ((actor != null && actor.alive()) || IsGameTypeSingle() == false)) {
          this.OnButton_return_game();
        }
      } else if (dik === DIK_keys.DIK_S) {
        this.OnButton_dev_debug_dialog();
      } else if (dik === DIK_keys.DIK_Q) {
        this.OnMessageQuitWin();
      }
    }

    return true;
  }
} as IMainMenu);
