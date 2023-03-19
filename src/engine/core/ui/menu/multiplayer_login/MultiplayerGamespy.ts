import {
  account_operation_cb,
  account_profiles_cb,
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  found_email_cb,
  Frect,
  game,
  login_operation_cb,
  LuabindClass,
  store_operation_cb,
  suggest_nicks_cb,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUICheckButton,
  XR_CUIComboBox,
  XR_CUIEditBox,
  XR_CUIMessageBoxEx,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_profile,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional } from "@/engine/lib/types";

const base: string = "menu\\multiplayer\\MultiplayerGamespy.component";
const logger: LuaLogger = new LuaLogger($filename);

let ctrl: boolean = false;
let focused_eb: number = 0;

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerGameSpy extends CUIScriptWnd {
  public owner: MainMenu;

  public ca_email_valid: boolean = false;
  public ca_passwords_valid: boolean = false;
  public ca_unique_nick_valid: boolean = false;

  public active_page: string = "login_page";
  public email: string = "";
  public password: string = "";
  public profile_name: string = "";

  public login_page!: XR_CUIWindow;
  public create_account_page!: XR_CUIWindow;
  public lp_header_login!: XR_CUITextWnd;
  public lp_btn_forgot!: XR_CUI3tButton;
  public lp_password!: XR_CUIEditBox;
  public lp_email!: XR_CUIEditBox;
  public lp_check_remember_me!: XR_CUICheckButton;
  public ca_email!: XR_CUIEditBox;
  public ca_header_create_acc!: XR_CUITextWnd;
  public ca_error!: XR_CUITextWnd;
  public ca_password!: XR_CUIEditBox;
  public ca_st_password!: XR_CUIStatic;
  public ca_st_email!: XR_CUIStatic;
  public ca_confirm_password!: XR_CUIEditBox;
  public ca_st_confirm_password!: XR_CUIStatic;
  public ca_unique_nick!: XR_CUIEditBox;
  public ca_st_unique_nick!: XR_CUIStatic;
  public ca_combo_aval_unique_nick!: XR_CUIComboBox;
  public btn_create_acc!: XR_CUI3tButton;
  public btn_create!: XR_CUI3tButton;
  public btn_login!: XR_CUI3tButton;
  public btn_cancel!: XR_CUI3tButton;
  public gs_message_box!: XR_CUIMessageBoxEx;
  public gs_mb_create_vnick_cancel!: XR_CUIMessageBoxEx;
  public gs_mb_create_vemail_cancel!: XR_CUIMessageBoxEx;
  public gs_create_mb_result!: XR_CUIMessageBoxEx;
  public gs_login_mb_result!: XR_CUIMessageBoxEx;
  public gs_login_mb_profnotfound!: XR_CUIMessageBoxEx;
  public gs_login_mb_cancel!: XR_CUIMessageBoxEx;

  public constructor(owner: MainMenu) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallbacks();
  }

  public InitControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);
    xml.InitStatic("background", this);

    let button = null;

    button = xml.Init3tButton("button_create_acc", this);
    this.Register(button, "btn_create_acc");
    this.btn_create_acc = button;

    button = xml.Init3tButton("button_create", this);
    this.Register(button, "btn_create");
    this.btn_create = button;

    button = xml.Init3tButton("button_login", this);
    this.Register(button, "btn_login");
    this.btn_login = button;

    button = xml.Init3tButton("button_cancel", this);
    this.Register(button, "btn_cancel");
    this.btn_cancel = button;
    // --------------------------------------------------------------------------------
    this.login_page = new CUIWindow();
    xml.InitWindow("login_page", 0, this.login_page);
    this.login_page.SetAutoDelete(true);
    this.AttachChild(this.login_page);

    this.lp_header_login = xml.InitTextWnd("login_page:cap_header_login", this.login_page);

    xml.InitTextWnd("login_page:cap_email", this.login_page);
    this.lp_email = xml.InitEditBox("login_page:edit_email", this.login_page);
    this.Register(this.lp_email, "lp_edit_email");

    xml.InitTextWnd("login_page:cap_password", this.login_page);
    this.lp_password = xml.InitEditBox("login_page:edit_password", this.login_page);
    this.Register(this.lp_password, "lp_edit_password");

    button = xml.Init3tButton("login_page:button_forgot", this.login_page);
    this.Register(button, "lp_btn_forgot");
    this.lp_btn_forgot = button;

    button = xml.InitCheck("login_page:check_remember_me", this.login_page);
    this.Register(button, "lp_check_remember_me");
    button.SetCheck(true);
    this.lp_check_remember_me = button;

    this.lp_email.SetNextFocusCapturer(this.lp_password);
    this.lp_password.SetNextFocusCapturer(this.lp_email);
    // --------------------------------------------------------------------------------
    this.create_account_page = new CUIWindow();
    xml.InitWindow("create_account_page", 0, this.create_account_page);
    this.create_account_page.SetAutoDelete(true);
    this.AttachChild(this.create_account_page);

    this.ca_header_create_acc = xml.InitTextWnd(
      "create_account_page:cap_header_create_account",
      this.create_account_page
    );
    this.ca_error = xml.InitTextWnd("create_account_page:cap_error", this.create_account_page);

    xml.InitTextWnd("create_account_page:cap_email", this.create_account_page);
    this.ca_email = xml.InitEditBox("create_account_page:edit_email", this.create_account_page);
    this.Register(this.ca_email, "ca_edit_email");
    this.ca_st_email = xml.InitStatic("create_account_page:static_email", this.create_account_page);

    xml.InitTextWnd("create_account_page:cap_password", this.create_account_page);
    this.ca_password = xml.InitEditBox("create_account_page:edit_password", this.create_account_page);
    this.Register(this.ca_password, "ca_edit_password");
    this.ca_st_password = xml.InitStatic("create_account_page:static_password", this.create_account_page);

    xml.InitTextWnd("create_account_page:cap_confirm_password", this.create_account_page);
    this.ca_confirm_password = xml.InitEditBox("create_account_page:edit_confirm_password", this.create_account_page);
    this.Register(this.ca_confirm_password, "ca_edit_confirm_password");
    this.ca_st_confirm_password = xml.InitStatic(
      "create_account_page:static_confirm_password",
      this.create_account_page
    );

    xml.InitTextWnd("create_account_page:cap_unique_nick", this.create_account_page);
    this.ca_unique_nick = xml.InitEditBox("create_account_page:edit_unique_nick", this.create_account_page);
    this.Register(this.ca_unique_nick, "ca_edit_unique_nick");
    this.ca_st_unique_nick = xml.InitStatic("create_account_page:static_unique_nick", this.create_account_page);

    this.ca_combo_aval_unique_nick = xml.InitComboBox(
      "create_account_page:combo_aval_unique_nick",
      this.create_account_page
    );
    this.Register(this.ca_combo_aval_unique_nick, "ca_combo_aval_unique_nick");

    this.ca_email.SetNextFocusCapturer(this.ca_password);
    this.ca_password.SetNextFocusCapturer(this.ca_confirm_password);
    this.ca_confirm_password.SetNextFocusCapturer(this.ca_unique_nick);
    this.ca_unique_nick.SetNextFocusCapturer(this.ca_email);

    // -- // message boxes

    this.gs_login_mb_cancel = new CUIMessageBoxEx();
    this.Register(this.gs_login_mb_cancel, "gs_mb_login_cancel");

    this.gs_login_mb_profnotfound = new CUIMessageBoxEx();
    this.Register(this.gs_login_mb_profnotfound, "gs_mb_login_profnotfound");

    this.gs_login_mb_result = new CUIMessageBoxEx();
    this.Register(this.gs_login_mb_result, "gs_mb_login_result");

    this.gs_create_mb_result = new CUIMessageBoxEx();
    this.Register(this.gs_create_mb_result, "gs_mb_create_result");

    this.gs_mb_create_vemail_cancel = new CUIMessageBoxEx();
    this.Register(this.gs_mb_create_vemail_cancel, "gs_mb_create_vemail_cancel");

    this.gs_mb_create_vnick_cancel = new CUIMessageBoxEx();
    this.Register(this.gs_mb_create_vnick_cancel, "gs_mb_create_vnick_cancel");

    this.gs_message_box = new CUIMessageBoxEx();
    this.Register(this.gs_message_box, "gs_message_box");

    // -- ///////////////

    this.create_account_page.Show(false);

    focused_eb = 0;

    this.ChangeActiveEditBox();
    this.CheckAccCreationAbility();
  }

  public InitCallbacks(): void {
    this.AddCallback("btn_create_acc", ui_events.BUTTON_CLICKED, () => this.OnBtnShowCreateAccountPage(), this);
    this.AddCallback("btn_create", ui_events.BUTTON_CLICKED, () => this.OnBtnCreateAccount(), this);

    this.AddCallback("btn_login", ui_events.BUTTON_CLICKED, () => this.OnBtnLogin(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnBtnCancel(), this);
    this.AddCallback("lp_check_remember_me", ui_events.BUTTON_CLICKED, () => this.OnBtnRememberMe(), this);

    this.AddCallback("lp_edit_email", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditLPEmailChanged(), this);
    this.AddCallback("lp_edit_password", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditLPPasswordChanged(), this);
    this.AddCallback("lp_btn_forgot", ui_events.BUTTON_CLICKED, () => this.OnBtnLPForgotPassword(), this);

    this.AddCallback("ca_edit_email", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditCAEmailChanged(), this);
    this.AddCallback("ca_edit_password", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditCAPasswordChanged(), this);
    this.AddCallback(
      "ca_edit_confirm_password",
      ui_events.EDIT_TEXT_COMMIT,
      () => this.OnEditCAConfirmPasswordChanged(),
      this
    );
    this.AddCallback("ca_edit_unique_nick", ui_events.EDIT_TEXT_COMMIT, () => this.OnEditCAUniqueNickChanged(), this);

    this.AddCallback("ca_combo_aval_unique_nick", ui_events.LIST_ITEM_SELECT, () => this.OnUniqueNickSelect(), this);
    this.AddCallback("ca_combo_aval_unique_nick", ui_events.WINDOW_LBUTTON_DOWN, () => this.OnUniqueNickSelect(), this);

    this.AddCallback(
      "gs_mb_login_profnotfound",
      ui_events.MESSAGE_BOX_YES_CLICKED,
      () => this.LoginProfileUseExist(),
      this
    );
    this.AddCallback(
      "gs_mb_login_profnotfound",
      ui_events.MESSAGE_BOX_NO_CLICKED,
      () => this.LoginProfileNotFound(),
      this
    );
    this.AddCallback("gs_mb_login_result", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.OnLoginResultOk(), this);
    this.AddCallback("gs_mb_create_result", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.CreatedAccount(), this);

    this.AddCallback("gs_mb_login_cancel", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.TerminateLogin(), this);
    this.AddCallback(
      "gs_mb_create_vemail_cancel",
      ui_events.MESSAGE_BOX_OK_CLICKED,
      () => this.TerminateVerifyEmail(),
      this
    );
    this.AddCallback(
      "gs_mb_create_vnick_cancel",
      ui_events.MESSAGE_BOX_OK_CLICKED,
      () => this.TerminateVerifyNick(),
      this
    );
  }

  public ShowLoginPage(): void {
    const mail: string = this.owner.xrLoginManager.get_email_from_registry();
    const pass: string = this.owner.xrLoginManager.get_password_from_registry();

    if (mail !== "" && pass !== "") {
      this.lp_email.SetText(mail);
      this.lp_password.SetText(pass);
    }

    this.lp_check_remember_me.SetCheck(this.owner.xrLoginManager!.get_remember_me_from_registry());

    this.btn_create_acc.Show(true);
    this.btn_login.Show(true);
    this.btn_create.Show(false);

    this.active_page = "login_page";
    this.create_account_page.Show(false);
    this.login_page.Show(true);

    focused_eb = 0;
    // --    this.ChangeActiveEditBox()
  }

  public OnBtnCancel(): void {
    logger.info("Button cancel");

    if (this.active_page === "create_account_page") {
      this.ShowLoginPage();
    } else {
      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
    }
  }

  public OnBtnRememberMe(): void {
    logger.info("Button remember me");
    this.owner.xrLoginManager.save_remember_me_to_registry(this.lp_check_remember_me.GetCheck());
  }

  public CheckAccCreationAbility() {
    this.btn_create.Enable(false);
    if (this.ca_email_valid === true && this.ca_passwords_valid === true && this.ca_unique_nick_valid === true) {
      this.btn_create.Enable(true);
    }
  }

  public OnBtnCreateAccount() {
    this.gs_message_box.InitMessageBox("message_box_gs_acc_creation");
    this.gs_message_box.SetText("ui_mp_gamespy_creating_new_profile");
    this.gs_message_box.ShowDialog(true);
    this.owner.xrAccountManager.create_profile(
      this.ca_email.GetText(),
      this.ca_unique_nick.GetText(),
      this.ca_email.GetText(),
      this.ca_password.GetText(),
      new account_operation_cb(this, (code, description) => this.AccountCreationResult(code, description))
    );
  }

  public OnBtnShowCreateAccountPage() {
    const empty_text = "";

    this.ca_email.SetText(empty_text);
    this.ca_password.SetText(empty_text);
    this.ca_confirm_password.SetText(empty_text);
    this.ca_unique_nick.SetText(empty_text);

    this.ca_email_valid = false;
    this.ca_passwords_valid = false;
    this.ca_unique_nick_valid = false;

    this.ca_st_email.InitTexture("ui_inGame2_lamp_OFF");
    this.ca_st_password.InitTexture("ui_inGame2_lamp_OFF");
    this.ca_st_confirm_password.InitTexture("ui_inGame2_lamp_OFF");
    this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_OFF");

    this.ca_error.SetText(empty_text);

    this.btn_create_acc.Enable(false);
    this.active_page = "create_account_page";
    this.create_account_page.Show(true);
    this.btn_create_acc.Show(false);
    this.ca_combo_aval_unique_nick.Show(false);
    this.ca_combo_aval_unique_nick.ClearList();
    this.btn_login.Show(false);
    this.btn_create.Show(true);
    this.login_page.Show(false);

    focused_eb = 0;

    this.ChangeActiveEditBox();
    this.CheckAccCreationAbility();
  }

  public OnBtnLogin(): void {
    this.email = this.lp_email.GetText();
    this.password = this.lp_password.GetText();
    this.gs_login_mb_cancel.InitMessageBox("message_box_gs_info");
    this.gs_login_mb_cancel.SetText("ui_mp_gamespy_getting_account_profiles");
    this.gs_login_mb_cancel.ShowDialog(true);
    this.profile_name = "";
    this.owner.xrAccountManager.search_for_email(
      this.email,
      new found_email_cb(this, (found, description) => this.OnLoginEmailSearchComplete(found, description))
    );
  }

  public OnLoginEmailSearchComplete(found: boolean, description: string) {
    if (!found) {
      this.gs_login_mb_cancel.HideDialog();
      this.gs_login_mb_result.InitMessageBox("message_box_gs_result");
      if (description === "") {
        description = game.translate_string("mp_gp_unknown_email");
      }

      this.gs_login_mb_result.SetText(description);
      this.gs_login_mb_result.ShowDialog(true);

      return;
    }

    this.owner.xrAccountManager.get_account_profiles(
      this.email,
      this.password,
      new account_profiles_cb(this, (code, description) => this.GetAccountProfilesResult(code, description))
    );
  }

  public GetAccountProfilesResult(profilesCount: number, description: string): void {
    logger.info("Got profiles response:", type(profilesCount), description);

    if (profilesCount === 0) {
      this.gs_login_mb_cancel.HideDialog();
      this.gs_login_mb_result.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = game.translate_string("mp_gp_bad_password");
      }

      logger.info("Failed to login: ", description);

      this.gs_login_mb_result.SetText(description);
      this.gs_login_mb_result.ShowDialog(true);
    } else {
      for (const it of this.owner.xrAccountManager.get_found_profiles()) {
        if (this.profile_name === "") {
          this.profile_name = it;
        }

        if (it === this.email) {
          this.gs_login_mb_cancel.SetText("ui_mp_gamespy_logining_to_profile");
          this.owner.xrLoginManager.login(
            this.email,
            // todo: Maybe typo.
            this.email,
            this.password,
            new login_operation_cb(this, (code, description) => this.LoginOperationResult(code, description))
          );

          return;
        }
      }

      this.gs_login_mb_cancel.HideDialog();
      this.LoginProfileUseExist();

      // --this.gs_login_mb_profnotfound.InitMessageBox("message_box_gs_question");
      // --this.gs_login_mb_profnotfound.SetText(game.translate_string("ui_mp_gamespy_use_existing_profile") +
      // " " + this.profile_name + "?");
      // --this.gs_login_mb_profnotfound.ShowDialog(true);
    }
  }

  public LoginOperationResult(profile: Optional<XR_profile>, description: string) {
    logger.info("Login operation result:", type(profile), description);
    this.gs_login_mb_cancel.HideDialog();

    if (profile === null) {
      logger.info("Login failed");

      this.gs_login_mb_result.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = "mp_gp_login_error";
      }

      this.gs_login_mb_result.SetText(description);
      this.gs_login_mb_result.ShowDialog(true);
    } else {
      logger.info("Continue with profile info load");

      this.owner.xrGameSpyProfile = profile;
      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main_logout"
      );
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);
      this.owner.xrProfileStore.load_current_profile(
        new store_operation_cb(this, (code, description) => this.LoadingProgress(code, description)),
        new store_operation_cb(this, (code, description) => this.LoadingComplete(code, description))
      );

      if (this.lp_check_remember_me.GetCheck()) {
        this.owner.xrLoginManager.save_email_to_registry(this.email);
        this.owner.xrLoginManager.save_password_to_registry(this.password);
      }
    }
  }

  public TerminateLogin(): void {
    logger.info("Terminate login");

    if (this.owner.xrGameSpyProfile !== null) {
      this.owner.xrProfileStore.stop_loading();
      this.owner.xrLoginManager.logout();
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_new_network_game);
      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main"
      );
    } else if (this.profile_name === "") {
      this.owner.xrAccountManager.stop_fetching_account_profiles();
    } else {
      this.owner.xrLoginManager.stop_login();
    }

    this.owner.xrGameSpyProfile = null;
  }

  public LoginProfileUseExist(): void {
    logger.info("Profile use existing");

    this.gs_login_mb_cancel.InitMessageBox("message_box_gs_info");
    this.gs_login_mb_cancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.gs_login_mb_cancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profile_name,
      this.password,
      new login_operation_cb(this, (profile, description) => this.LoginOperationResult(profile, description))
    );
  }

  public LoginProfileNotFound(): void {
    this.OnBtnShowCreateAccountPage();
  }

  public OnLoginResultOk() {
    if (this.owner.xrGameSpyProfile) {
      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.onButtonClickMultiplayer();
    }
  }

  public CreatedAccount() {
    this.ShowLoginPage();
    this.lp_email.SetText(this.ca_email.GetText());
    this.lp_password.SetText(this.ca_password.GetText());
    // --this.OnBtnLogin();
  }

  public OnMsgYes() {
    this.gs_login_mb_cancel.InitMessageBox("message_box_gs_info");
    this.gs_login_mb_cancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.gs_login_mb_cancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profile_name,
      this.password,
      new login_operation_cb(this, (profile, description) => this.LoginOperationResult(profile, description))
    );
  }

  public OnMsgNo() {
    this.ca_email.SetText(this.email);
    this.ca_st_email.InitTexture("ui_inGame2_lamp_GREEN");
    this.ca_password.SetText(this.password);
    this.ca_st_password.InitTexture("ui_inGame2_lamp_GREEN");
    this.ca_confirm_password.SetText(this.password);
    this.ca_st_confirm_password.InitTexture("ui_inGame2_lamp_GREEN");
    this.OnBtnShowCreateAccountPage();
  }

  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_RELEASED) {
      if (key === DIK_keys.DIK_LCONTROL) {
        ctrl = false;
      }
    } else if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_LCONTROL) {
        ctrl = true;
      } else if (key === DIK_keys.DIK_ESCAPE) {
        this.OnBtnCancel();
      } else if (key === DIK_keys.DIK_TAB) {
        if (ctrl) {
          if (this.active_page === "login_page") {
            this.OnBtnShowCreateAccountPage();
          } else {
            this.OnBtnLogin();
          }
        }
      }
    }

    return true;
  }

  public OnEditLPEmailChanged(): void {
    // --this.OnBtnLogin();
  }

  public OnEditLPPasswordChanged(): void {
    // --this.OnBtnLogin();
  }

  public OnBtnLPForgotPassword(): void {
    this.owner.xrLoginManager.forgot_password("https://login.gamespy.com/lostpassword.aspx");
  }

  public LoadingProgress(fake_bool: any, progress_string: string) {
    if (this.gs_login_mb_cancel.IsShown()) {
      this.gs_login_mb_cancel.HideDialog();
    }

    this.gs_login_mb_cancel.InitMessageBox("message_box_gs_info");
    this.gs_login_mb_cancel.SetText(progress_string);
    this.gs_login_mb_cancel.ShowDialog(true);
  }

  public LoadingComplete(load_result: number | boolean, descr: string): void {
    this.gs_login_mb_cancel.HideDialog();
    this.gs_login_mb_result.InitMessageBox("message_box_gs_result");

    if (load_result === true) {
      const tmp_unick = this.owner.xrGameSpyProfile!.unique_nick();
      let hello_text = game.translate_string("ui_mp_gamespy_loading_rewards_hello") + " " + tmp_unick + "!";

      if (tmp_unick === "@unregistered") {
        hello_text = game.translate_string("mp_gp_unique_nick_not_registred");
      }

      if (tmp_unick === "@expired") {
        hello_text = game.translate_string("mp_gp_unique_nick_has_expired");
      }

      this.gs_login_mb_result.SetText(hello_text);
    } else {
      this.gs_login_mb_result.SetText(descr);
    }

    this.gs_login_mb_result.ShowDialog(true);
  }

  public ChangeActiveEditBox(): void {
    this.lp_email.CaptureFocus(false);
    this.lp_password.CaptureFocus(false);
    this.ca_email.CaptureFocus(false);
    this.ca_password.CaptureFocus(false);
    this.ca_confirm_password.CaptureFocus(false);
    this.ca_unique_nick.CaptureFocus(false);

    if (this.active_page === "login_page") {
      this.lp_email.CaptureFocus(true);
    } else {
      this.ca_password.CaptureFocus(true);
    }
  }

  public OnEditCAEmailChanged() {
    const email = this.ca_email.GetText();

    if (email !== "") {
      if (this.owner.xrAccountManager.verify_email(email)) {
        this.gs_mb_create_vemail_cancel.InitMessageBox("message_box_gs_info");
        this.gs_mb_create_vemail_cancel.SetText("ui_mp_gamespy_verify_email");
        this.gs_mb_create_vemail_cancel.ShowDialog(true);
        this.owner.xrAccountManager.search_for_email(
          this.ca_email.GetText(),
          new found_email_cb(this, (found, description) => this.OnEmailSearchComplete(found, description))
        );
      } else {
        this.ca_st_email.InitTexture("ui_inGame2_lamp_RED");
        this.ca_error.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      }
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAPasswordChanged() {
    const pass = this.ca_password.GetText();

    if (this.owner.xrAccountManager.verify_password(pass)) {
      this.ca_st_password.InitTexture("ui_inGame2_lamp_GREEN");
      this.ca_error.SetText("");
    } else {
      this.ca_st_password.InitTexture("ui_inGame2_lamp_RED");
      this.ca_error.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      this.ca_passwords_valid = false;
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAConfirmPasswordChanged() {
    const pass = this.ca_password.GetText();
    const conf_pass = this.ca_confirm_password.GetText();

    if (pass === conf_pass) {
      if (this.owner.xrAccountManager.verify_password(pass)) {
        this.ca_st_confirm_password.InitTexture("ui_inGame2_lamp_GREEN");
        this.ca_error.SetText("");
        this.ca_passwords_valid = true;
      } else {
        this.ca_st_confirm_password.InitTexture("ui_inGame2_lamp_RED");
        this.ca_error.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
        this.ca_passwords_valid = false;
      }
    } else {
      this.ca_st_confirm_password.InitTexture("ui_inGame2_lamp_RED");
      this.ca_error.SetText(game.translate_string("ui_mp_gamespy_verify_password_error1"));
      this.ca_passwords_valid = false;
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAUniqueNickChanged() {
    const nick = this.ca_unique_nick.GetText();

    if (this.owner.xrAccountManager.verify_unique_nick(nick)) {
      this.gs_mb_create_vnick_cancel.InitMessageBox("message_box_gs_info");
      this.gs_mb_create_vnick_cancel.SetText("ui_mp_gamespy_suggesting_unique_name");
      this.gs_mb_create_vnick_cancel.ShowDialog(true);
      this.owner.xrAccountManager.suggest_unique_nicks(
        nick,
        new suggest_nicks_cb(this, (code: number, description: string) => {
          this.OnNickSuggestionComplete(code, description);
        })
      );
      this.ca_combo_aval_unique_nick.Show(true);
      this.ca_combo_aval_unique_nick.ClearList();
    } else {
      this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_RED");
      this.ca_error.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
    }
  }

  public TerminateVerifyEmail(): void {
    this.owner.xrAccountManager.stop_searching_email();
    this.ca_st_email.InitTexture("ui_inGame2_lamp_RED");
    this.ca_email_valid = false;
  }

  public OnEmailSearchComplete(found: boolean, description: string): void {
    this.gs_mb_create_vemail_cancel.HideDialog();

    if (found) {
      this.ca_st_email.InitTexture("ui_inGame2_lamp_RED");
      this.ca_error.SetText(game.translate_string("ui_mp_gamespy_email_already_exist"));
      this.ca_email_valid = false;
    } else {
      this.ca_st_email.InitTexture("ui_inGame2_lamp_GREEN");
      this.ca_error.SetText("");
      this.ca_email_valid = true;
    }

    this.CheckAccCreationAbility();
  }

  public TerminateVerifyNick() {
    this.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_RED");
    this.ca_unique_nick_valid = false;
  }

  public OnUniqueNickSelect(): void {
    this.ca_unique_nick.SetText(this.ca_combo_aval_unique_nick.GetText());
    this.OnEditCAUniqueNickChanged();
    this.CheckAccCreationAbility();
  }

  public AccountCreationResult(tmp: number, descr: string): void {
    this.gs_message_box.HideDialog();

    if (descr === "") {
      this.gs_create_mb_result.InitMessageBox("message_box_gs_result");
      this.gs_create_mb_result.SetText("ui_mp_gamespy_profile_created");
      this.gs_create_mb_result.ShowDialog(true);
    } else {
      this.gs_message_box.InitMessageBox("message_box_gs_result");
      this.gs_message_box.SetText(descr);
      this.gs_message_box.ShowDialog(true);
    }
  }

  public OnNickSuggestionComplete(result: number, description: string): void {
    logger.info("On nick suggestion complete:", description);

    this.gs_mb_create_vnick_cancel.HideDialog();
    this.btn_create_acc.Enable(false);

    if (result > 0) {
      let index: number = 1;

      for (const it of this.owner.xrAccountManager.get_suggested_unicks()) {
        if (it === this.ca_unique_nick.GetText()) {
          this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_GREEN");
          this.ca_unique_nick_valid = true;
          this.btn_create_acc.Enable(true);
          this.ca_combo_aval_unique_nick.Show(false);
          this.CheckAccCreationAbility();

          return;
        }

        this.ca_combo_aval_unique_nick.AddItem(it, index);

        index += 1;
      }

      const first_name = this.ca_combo_aval_unique_nick.GetTextOf(0);

      this.ca_combo_aval_unique_nick.SetText(first_name);
      this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_RED");
      this.gs_message_box.InitMessageBox("message_box_gs_result");
      this.gs_message_box.SetText("ui_mp_gamespy_verify_nickname_error1");
      this.gs_message_box.ShowDialog(true);
      this.ca_unique_nick_valid = false;
    } else {
      this.ca_st_unique_nick.InitTexture("ui_inGame2_lamp_RED");
      this.gs_message_box.InitMessageBox("message_box_gs_result");
      this.gs_message_box.SetText(description);
      this.gs_message_box.ShowDialog(true);
      this.ca_unique_nick_valid = false;
    }

    this.CheckAccCreationAbility();
  }
}
