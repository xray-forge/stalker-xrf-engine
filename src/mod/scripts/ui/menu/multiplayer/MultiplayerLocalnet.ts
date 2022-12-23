import { Optional } from "@/mod/lib/types";
import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import { IMainMenu } from "@/mod/scripts/ui/menu/MainMenu";
import { resolveXmlFormPath } from "@/mod/scripts/utils/rendering";

const base: string = "menu\\multiplayer\\MultiplayerLocalnet.component";
const log: DebugLogger = new DebugLogger("MultiplayerLocalnet");

export interface IMultiplayerLocalnet extends XR_CUIScriptWnd {
  owner: IMainMenu;

  login_page: XR_CUIWindow;

  btn_login: XR_CUI3tButton;
  btn_cancel: XR_CUI3tButton;

  lp_header_login: XR_CUITextWnd;
  lp_nickname: XR_CUIEditBox;
  gs_login_message_box: XR_CUIMessageBoxEx;
  lp_check_remember_me: XR_CUICheckButton;

  InitControls(): void;
  InitCallbacks(): void;
  OnBtnLogin(): void;
  OnMsgOk(): void;
  OnBtnCancel(): void;
  OnBtnRememberMe(): void;
  OnEditLPNicknameChanged(): void;

  LoginOperationResult(profile: Optional<XR_profile>, description: string): void;
}

export const MultiplayerLocalnet: IMultiplayerLocalnet = declare_xr_class("MultiplayerLocalnet", CUIScriptWnd, {
  __init(): void {
    xr_class_super();

    this.InitControls();
    this.InitCallbacks();
  },
  __finalize(): void {},
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);
    xml.InitStatic("background", this);

    this.btn_login = xml.Init3tButton("button_login", this);
    log.info("Init 1");

    this.Register(this.btn_login, "btn_login");

    this.btn_cancel = xml.Init3tButton("button_cancel", this);
    this.Register(this.btn_cancel, "btn_cancel");

    log.info("Init 2");

    // --------------------------------------------------------------------------------
    this.login_page = new CUIWindow();
    xml.InitWindow("login_page", 0, this.login_page);
    this.login_page.SetAutoDelete(true);
    this.AttachChild(this.login_page);

    log.info("Init 3");
    xml.InitWindow("login_page", 0, this.login_page);
    this.lp_header_login = xml.InitTextWnd("login_page:cap_header_login", this.login_page);

    log.info("Init 4");
    xml.InitTextWnd("login_page:cap_nickname", this.login_page);
    this.lp_nickname = xml.InitEditBox("login_page:edit_nickname", this.login_page);
    this.Register(this.lp_nickname, "lp_edit_nickname");

    log.info("Init 5");
    this.gs_login_message_box = new CUIMessageBoxEx();
    this.Register(this.gs_login_message_box, "gs_message_box");

    log.info("Init 6");
    this.lp_check_remember_me = xml.InitCheck("login_page:check_remember_me", this.login_page);
    this.Register(this.lp_check_remember_me, "lp_check_remember_me");

    log.info("Init 7");
    this.lp_nickname.CaptureFocus(true);
  },
  InitCallbacks(): void {
    log.info("Init callbacks");

    this.AddCallback("btn_login", ui_events.BUTTON_CLICKED, () => this.OnBtnLogin(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnBtnCancel(), this);
    this.AddCallback("lp_check_remember_me", ui_events.BUTTON_CLICKED, () => this.OnBtnRememberMe(), this);

    this.AddCallback("lp_edit_nickname", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditLPNicknameChanged(), this);
    this.AddCallback("gs_message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnMsgOk(), this);
  },
  OnBtnLogin(): void {
    log.info("On button login");

    this.owner.loginManager.login_offline(
      this.lp_nickname.GetText(),
      new login_operation_cb(this, (profile, description) => this.LoginOperationResult(profile, description))
    );
  },
  LoginOperationResult(profile: Optional<XR_profile>, description: string) {
    log.info("Login operation result:", type(profile), type(description));

    if (profile === null) {
      log.info("No profile");
      this.gs_login_message_box.InitMessageBox("message_box_gs_result");
      this.gs_login_message_box.SetText(description);
      this.gs_login_message_box.ShowDialog(true);
    } else {
      log.info("With profile");
      this.owner.gameSpyProfile = profile;

      this.owner.shniaga.SetPage(CUIMMShniaga.epi_main, "menu/MainMenu.component.xml", "menu_main_logout");
      this.owner.shniaga.ShowPage(CUIMMShniaga.epi_main);

      if (this.lp_check_remember_me.GetCheck()) {
        log.info("Saving to registry:", profile === null);
        this.owner.loginManager.save_nick_to_registry(profile.unique_nick());
      }

      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.OnButton_multiplayer_clicked();
    }
  },
  OnMsgOk(): void {
    log.info("On message ok");
  },
  OnBtnCancel(): void {
    log.info("On button cancel");
    this.HideDialog();
    this.owner.ShowDialog(true);
    this.owner.Show(true);
  },
  OnBtnRememberMe(): void {
    log.info("On button remember me");
    this.owner.loginManager.save_remember_me_to_registry(this.lp_check_remember_me.GetCheck());
  },
  OnEditLPNicknameChanged(): void {
    this.OnBtnLogin();
  },
  OnKeyboard(key, event) {
    CUIScriptWnd.OnKeyboard(this, key, event);

    if (event == ui_events.WINDOW_KEY_PRESSED) {
      if (key == DIK_keys.DIK_ESCAPE) {
        this.OnBtnCancel();
      }
    }

    return true;
  }
} as IMultiplayerLocalnet);
