import {
  account_operation_cb,
  account_profiles_cb,
  CScriptXmlInit,
  CUI3tButton,
  CUICheckButton,
  CUIComboBox,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIStatic,
  CUITextWnd,
  CUIWindow,
  DIK_keys,
  found_email_cb,
  Frect,
  game,
  login_operation_cb,
  LuabindClass,
  profile,
  store_operation_cb,
  suggest_nicks_cb,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional, TKeyCode, TLabel, TName, TPath, TUIEvent } from "@/engine/lib/types";

const base: TPath = "menu\\multiplayer\\MultiplayerGamespy.component";
const logger: LuaLogger = new LuaLogger($filename);

let ctrl: boolean = false;
let focusedEb: number = 0;

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerGameSpy extends CUIScriptWnd {
  public owner: MainMenu;

  public caEmailValid: boolean = false;
  public caPasswordsValid: boolean = false;
  public caUniqueNickValid: boolean = false;

  public activePage: string = "login_page";
  public email: string = "";
  public password: string = "";
  public profileName: string = "";

  public loginPage!: CUIWindow;
  public createAccountPage!: CUIWindow;
  public lpHeaderLogin!: CUITextWnd;
  public lpForgotButton!: CUI3tButton;
  public lpPassword!: CUIEditBox;
  public lpEmail!: CUIEditBox;
  public lpCheckRememberMe!: CUICheckButton;
  public caEmail!: CUIEditBox;
  public caHeaderCreateAcc!: CUITextWnd;
  public caError!: CUITextWnd;
  public caPassword!: CUIEditBox;
  public caStPassword!: CUIStatic;
  public caStEmail!: CUIStatic;
  public caConfirmPassword!: CUIEditBox;
  public caStConfirmPassword!: CUIStatic;
  public caUniqueNick!: CUIEditBox;
  public caStUniqueNick!: CUIStatic;
  public caComboAvalUniqueNick!: CUIComboBox;
  public createAccountButton!: CUI3tButton;
  public createButton!: CUI3tButton;
  public loginButton!: CUI3tButton;
  public cancelButton!: CUI3tButton;
  public gsMessageBox!: CUIMessageBoxEx;
  public gsMbCreateVnickCancel!: CUIMessageBoxEx;
  public gsMbCreateVemailCancel!: CUIMessageBoxEx;
  public gsCreateMbResult!: CUIMessageBoxEx;
  public gsLoginMbResult!: CUIMessageBoxEx;
  public gsLoginMbProfnotfound!: CUIMessageBoxEx;
  public gsLoginMbCancel!: CUIMessageBoxEx;

  public constructor(owner: MainMenu) {
    super();

    this.owner = owner;

    this.InitControls();
    this.InitCallbacks();
  }

  public InitControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);
    xml.InitStatic("background", this);

    let button = null;

    button = xml.Init3tButton("button_create_acc", this);
    this.Register(button, "btn_create_acc");
    this.createAccountButton = button;

    button = xml.Init3tButton("button_create", this);
    this.Register(button, "btn_create");
    this.createButton = button;

    button = xml.Init3tButton("button_login", this);
    this.Register(button, "btn_login");
    this.loginButton = button;

    button = xml.Init3tButton("button_cancel", this);
    this.Register(button, "btn_cancel");
    this.cancelButton = button;
    // --------------------------------------------------------------------------------
    this.loginPage = new CUIWindow();
    xml.InitWindow("login_page", 0, this.loginPage);
    this.loginPage.SetAutoDelete(true);
    this.AttachChild(this.loginPage);

    this.lpHeaderLogin = xml.InitTextWnd("login_page:cap_header_login", this.loginPage);

    xml.InitTextWnd("login_page:cap_email", this.loginPage);
    this.lpEmail = xml.InitEditBox("login_page:edit_email", this.loginPage);
    this.Register(this.lpEmail, "lp_edit_email");

    xml.InitTextWnd("login_page:cap_password", this.loginPage);
    this.lpPassword = xml.InitEditBox("login_page:edit_password", this.loginPage);
    this.Register(this.lpPassword, "lp_edit_password");

    button = xml.Init3tButton("login_page:button_forgot", this.loginPage);
    this.Register(button, "lp_btn_forgot");
    this.lpForgotButton = button;

    button = xml.InitCheck("login_page:check_remember_me", this.loginPage);
    this.Register(button, "lp_check_remember_me");
    button.SetCheck(true);
    this.lpCheckRememberMe = button;

    this.lpEmail.SetNextFocusCapturer(this.lpPassword);
    this.lpPassword.SetNextFocusCapturer(this.lpEmail);
    // --------------------------------------------------------------------------------
    this.createAccountPage = new CUIWindow();
    xml.InitWindow("create_account_page", 0, this.createAccountPage);
    this.createAccountPage.SetAutoDelete(true);
    this.AttachChild(this.createAccountPage);

    this.caHeaderCreateAcc = xml.InitTextWnd("create_account_page:cap_header_create_account", this.createAccountPage);
    this.caError = xml.InitTextWnd("create_account_page:cap_error", this.createAccountPage);

    xml.InitTextWnd("create_account_page:cap_email", this.createAccountPage);
    this.caEmail = xml.InitEditBox("create_account_page:edit_email", this.createAccountPage);
    this.Register(this.caEmail, "ca_edit_email");
    this.caStEmail = xml.InitStatic("create_account_page:static_email", this.createAccountPage);

    xml.InitTextWnd("create_account_page:cap_password", this.createAccountPage);
    this.caPassword = xml.InitEditBox("create_account_page:edit_password", this.createAccountPage);
    this.Register(this.caPassword, "ca_edit_password");
    this.caStPassword = xml.InitStatic("create_account_page:static_password", this.createAccountPage);

    xml.InitTextWnd("create_account_page:cap_confirm_password", this.createAccountPage);
    this.caConfirmPassword = xml.InitEditBox("create_account_page:edit_confirm_password", this.createAccountPage);
    this.Register(this.caConfirmPassword, "ca_edit_confirm_password");
    this.caStConfirmPassword = xml.InitStatic("create_account_page:static_confirm_password", this.createAccountPage);

    xml.InitTextWnd("create_account_page:cap_unique_nick", this.createAccountPage);
    this.caUniqueNick = xml.InitEditBox("create_account_page:edit_unique_nick", this.createAccountPage);
    this.Register(this.caUniqueNick, "ca_edit_unique_nick");
    this.caStUniqueNick = xml.InitStatic("create_account_page:static_unique_nick", this.createAccountPage);

    this.caComboAvalUniqueNick = xml.InitComboBox("create_account_page:combo_aval_unique_nick", this.createAccountPage);
    this.Register(this.caComboAvalUniqueNick, "ca_combo_aval_unique_nick");

    this.caEmail.SetNextFocusCapturer(this.caPassword);
    this.caPassword.SetNextFocusCapturer(this.caConfirmPassword);
    this.caConfirmPassword.SetNextFocusCapturer(this.caUniqueNick);
    this.caUniqueNick.SetNextFocusCapturer(this.caEmail);

    // -- // message boxes

    this.gsLoginMbCancel = new CUIMessageBoxEx();
    this.Register(this.gsLoginMbCancel, "gs_mb_login_cancel");

    this.gsLoginMbProfnotfound = new CUIMessageBoxEx();
    this.Register(this.gsLoginMbProfnotfound, "gs_mb_login_profnotfound");

    this.gsLoginMbResult = new CUIMessageBoxEx();
    this.Register(this.gsLoginMbResult, "gs_mb_login_result");

    this.gsCreateMbResult = new CUIMessageBoxEx();
    this.Register(this.gsCreateMbResult, "gs_mb_create_result");

    this.gsMbCreateVemailCancel = new CUIMessageBoxEx();
    this.Register(this.gsMbCreateVemailCancel, "gs_mb_create_vemail_cancel");

    this.gsMbCreateVnickCancel = new CUIMessageBoxEx();
    this.Register(this.gsMbCreateVnickCancel, "gs_mb_create_vnick_cancel");

    this.gsMessageBox = new CUIMessageBoxEx();
    this.Register(this.gsMessageBox, "gs_message_box");

    // -- ///////////////

    this.createAccountPage.Show(false);

    focusedEb = 0;

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
      this.lpEmail.SetText(mail);
      this.lpPassword.SetText(pass);
    }

    this.lpCheckRememberMe.SetCheck(this.owner.xrLoginManager!.get_remember_me_from_registry());

    this.createAccountButton.Show(true);
    this.loginButton.Show(true);
    this.createButton.Show(false);

    this.activePage = "login_page";
    this.createAccountPage.Show(false);
    this.loginPage.Show(true);

    focusedEb = 0;
    // --    this.ChangeActiveEditBox()
  }

  public OnBtnCancel(): void {
    logger.info("Button cancel");

    if (this.activePage === "create_account_page") {
      this.ShowLoginPage();
    } else {
      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
    }
  }

  public OnBtnRememberMe(): void {
    logger.info("Button remember me");
    this.owner.xrLoginManager.save_remember_me_to_registry(this.lpCheckRememberMe.GetCheck());
  }

  public CheckAccCreationAbility() {
    this.createButton.Enable(false);
    if (this.caEmailValid === true && this.caPasswordsValid === true && this.caUniqueNickValid === true) {
      this.createButton.Enable(true);
    }
  }

  public OnBtnCreateAccount() {
    this.gsMessageBox.InitMessageBox("message_box_gs_acc_creation");
    this.gsMessageBox.SetText("ui_mp_gamespy_creating_new_profile");
    this.gsMessageBox.ShowDialog(true);
    this.owner.xrAccountManager.create_profile(
      this.caEmail.GetText(),
      this.caUniqueNick.GetText(),
      this.caEmail.GetText(),
      this.caPassword.GetText(),
      new account_operation_cb(this, (code, description) => this.AccountCreationResult(code, description))
    );
  }

  public OnBtnShowCreateAccountPage() {
    const emptyText: string = "";

    this.caEmail.SetText(emptyText);
    this.caPassword.SetText(emptyText);
    this.caConfirmPassword.SetText(emptyText);
    this.caUniqueNick.SetText(emptyText);

    this.caEmailValid = false;
    this.caPasswordsValid = false;
    this.caUniqueNickValid = false;

    this.caStEmail.InitTexture("ui_inGame2_lamp_OFF");
    this.caStPassword.InitTexture("ui_inGame2_lamp_OFF");
    this.caStConfirmPassword.InitTexture("ui_inGame2_lamp_OFF");
    this.caStUniqueNick.InitTexture("ui_inGame2_lamp_OFF");

    this.caError.SetText(emptyText);

    this.createAccountButton.Enable(false);
    this.activePage = "create_account_page";
    this.createAccountPage.Show(true);
    this.createAccountButton.Show(false);
    this.caComboAvalUniqueNick.Show(false);
    this.caComboAvalUniqueNick.ClearList();
    this.loginButton.Show(false);
    this.createButton.Show(true);
    this.loginPage.Show(false);

    focusedEb = 0;

    this.ChangeActiveEditBox();
    this.CheckAccCreationAbility();
  }

  public OnBtnLogin(): void {
    this.email = this.lpEmail.GetText();
    this.password = this.lpPassword.GetText();
    this.gsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.gsLoginMbCancel.SetText("ui_mp_gamespy_getting_account_profiles");
    this.gsLoginMbCancel.ShowDialog(true);
    this.profileName = "";
    this.owner.xrAccountManager.search_for_email(
      this.email,
      new found_email_cb(this, (found, description) => this.OnLoginEmailSearchComplete(found, description))
    );
  }

  public OnLoginEmailSearchComplete(found: boolean, description: string) {
    if (!found) {
      this.gsLoginMbCancel.HideDialog();
      this.gsLoginMbResult.InitMessageBox("message_box_gs_result");
      if (description === "") {
        description = game.translate_string("mp_gp_unknown_email");
      }

      this.gsLoginMbResult.SetText(description);
      this.gsLoginMbResult.ShowDialog(true);

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
      this.gsLoginMbCancel.HideDialog();
      this.gsLoginMbResult.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = game.translate_string("mp_gp_bad_password");
      }

      logger.info("Failed to login: ", description);

      this.gsLoginMbResult.SetText(description);
      this.gsLoginMbResult.ShowDialog(true);
    } else {
      for (const it of this.owner.xrAccountManager.get_found_profiles()) {
        if (this.profileName === "") {
          this.profileName = it;
        }

        if (it === this.email) {
          this.gsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
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

      this.gsLoginMbCancel.HideDialog();
      this.LoginProfileUseExist();

      // --this.gs_login_mb_profnotfound.InitMessageBox("message_box_gs_question");
      // --this.gs_login_mb_profnotfound.SetText(game.translate_string("ui_mp_gamespy_use_existing_profile") +
      // " " + this.profile_name + "?");
      // --this.gs_login_mb_profnotfound.ShowDialog(true);
    }
  }

  public LoginOperationResult(profile: Optional<profile>, description: string) {
    logger.info("Login operation result:", type(profile), description);
    this.gsLoginMbCancel.HideDialog();

    if (profile === null) {
      logger.info("Login failed");

      this.gsLoginMbResult.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = "mp_gp_login_error";
      }

      this.gsLoginMbResult.SetText(description);
      this.gsLoginMbResult.ShowDialog(true);
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

      if (this.lpCheckRememberMe.GetCheck()) {
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
    } else if (this.profileName === "") {
      this.owner.xrAccountManager.stop_fetching_account_profiles();
    } else {
      this.owner.xrLoginManager.stop_login();
    }

    this.owner.xrGameSpyProfile = null;
  }

  public LoginProfileUseExist(): void {
    logger.info("Profile use existing");

    this.gsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.gsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.gsLoginMbCancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profileName,
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
    this.lpEmail.SetText(this.caEmail.GetText());
    this.lpPassword.SetText(this.caPassword.GetText());
    // --this.OnBtnLogin();
  }

  public OnMsgYes() {
    this.gsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.gsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.gsLoginMbCancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profileName,
      this.password,
      new login_operation_cb(this, (profile, description) => this.LoginOperationResult(profile, description))
    );
  }

  public OnMsgNo() {
    this.caEmail.SetText(this.email);
    this.caStEmail.InitTexture("ui_inGame2_lamp_GREEN");
    this.caPassword.SetText(this.password);
    this.caStPassword.InitTexture("ui_inGame2_lamp_GREEN");
    this.caConfirmPassword.SetText(this.password);
    this.caStConfirmPassword.InitTexture("ui_inGame2_lamp_GREEN");
    this.OnBtnShowCreateAccountPage();
  }

  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
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
          if (this.activePage === "login_page") {
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

  public LoadingProgress(fakeBool: any, progressString: string) {
    if (this.gsLoginMbCancel.IsShown()) {
      this.gsLoginMbCancel.HideDialog();
    }

    this.gsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.gsLoginMbCancel.SetText(progressString);
    this.gsLoginMbCancel.ShowDialog(true);
  }

  public LoadingComplete(loadResult: number | boolean, descr: string): void {
    this.gsLoginMbCancel.HideDialog();
    this.gsLoginMbResult.InitMessageBox("message_box_gs_result");

    if (loadResult === true) {
      const tmpUnick: TName = this.owner.xrGameSpyProfile!.unique_nick();
      let helloText: TLabel = game.translate_string("ui_mp_gamespy_loading_rewards_hello") + " " + tmpUnick + "!";

      if (tmpUnick === "@unregistered") {
        helloText = game.translate_string("mp_gp_unique_nick_not_registred");
      }

      if (tmpUnick === "@expired") {
        helloText = game.translate_string("mp_gp_unique_nick_has_expired");
      }

      this.gsLoginMbResult.SetText(helloText);
    } else {
      this.gsLoginMbResult.SetText(descr);
    }

    this.gsLoginMbResult.ShowDialog(true);
  }

  public ChangeActiveEditBox(): void {
    this.lpEmail.CaptureFocus(false);
    this.lpPassword.CaptureFocus(false);
    this.caEmail.CaptureFocus(false);
    this.caPassword.CaptureFocus(false);
    this.caConfirmPassword.CaptureFocus(false);
    this.caUniqueNick.CaptureFocus(false);

    if (this.activePage === "login_page") {
      this.lpEmail.CaptureFocus(true);
    } else {
      this.caPassword.CaptureFocus(true);
    }
  }

  public OnEditCAEmailChanged() {
    const email: TName = this.caEmail.GetText();

    if (email !== "") {
      if (this.owner.xrAccountManager.verify_email(email)) {
        this.gsMbCreateVemailCancel.InitMessageBox("message_box_gs_info");
        this.gsMbCreateVemailCancel.SetText("ui_mp_gamespy_verify_email");
        this.gsMbCreateVemailCancel.ShowDialog(true);
        this.owner.xrAccountManager.search_for_email(
          this.caEmail.GetText(),
          new found_email_cb(this, (found, description) => this.OnEmailSearchComplete(found, description))
        );
      } else {
        this.caStEmail.InitTexture("ui_inGame2_lamp_RED");
        this.caError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      }
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAPasswordChanged() {
    const pass: string = this.caPassword.GetText();

    if (this.owner.xrAccountManager.verify_password(pass)) {
      this.caStPassword.InitTexture("ui_inGame2_lamp_GREEN");
      this.caError.SetText("");
    } else {
      this.caStPassword.InitTexture("ui_inGame2_lamp_RED");
      this.caError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      this.caPasswordsValid = false;
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAConfirmPasswordChanged() {
    const pass: string = this.caPassword.GetText();
    const confPass: string = this.caConfirmPassword.GetText();

    if (pass === confPass) {
      if (this.owner.xrAccountManager.verify_password(pass)) {
        this.caStConfirmPassword.InitTexture("ui_inGame2_lamp_GREEN");
        this.caError.SetText("");
        this.caPasswordsValid = true;
      } else {
        this.caStConfirmPassword.InitTexture("ui_inGame2_lamp_RED");
        this.caError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
        this.caPasswordsValid = false;
      }
    } else {
      this.caStConfirmPassword.InitTexture("ui_inGame2_lamp_RED");
      this.caError.SetText(game.translate_string("ui_mp_gamespy_verify_password_error1"));
      this.caPasswordsValid = false;
    }

    this.CheckAccCreationAbility();
  }

  public OnEditCAUniqueNickChanged() {
    const nick: TName = this.caUniqueNick.GetText();

    if (this.owner.xrAccountManager.verify_unique_nick(nick)) {
      this.gsMbCreateVnickCancel.InitMessageBox("message_box_gs_info");
      this.gsMbCreateVnickCancel.SetText("ui_mp_gamespy_suggesting_unique_name");
      this.gsMbCreateVnickCancel.ShowDialog(true);
      this.owner.xrAccountManager.suggest_unique_nicks(
        nick,
        new suggest_nicks_cb(this, (code: number, description: string) => {
          this.OnNickSuggestionComplete(code, description);
        })
      );
      this.caComboAvalUniqueNick.Show(true);
      this.caComboAvalUniqueNick.ClearList();
    } else {
      this.caStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.caError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
    }
  }

  public TerminateVerifyEmail(): void {
    this.owner.xrAccountManager.stop_searching_email();
    this.caStEmail.InitTexture("ui_inGame2_lamp_RED");
    this.caEmailValid = false;
  }

  public OnEmailSearchComplete(found: boolean, description: string): void {
    this.gsMbCreateVemailCancel.HideDialog();

    if (found) {
      this.caStEmail.InitTexture("ui_inGame2_lamp_RED");
      this.caError.SetText(game.translate_string("ui_mp_gamespy_email_already_exist"));
      this.caEmailValid = false;
    } else {
      this.caStEmail.InitTexture("ui_inGame2_lamp_GREEN");
      this.caError.SetText("");
      this.caEmailValid = true;
    }

    this.CheckAccCreationAbility();
  }

  public TerminateVerifyNick() {
    this.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.caStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
    this.caUniqueNickValid = false;
  }

  public OnUniqueNickSelect(): void {
    this.caUniqueNick.SetText(this.caComboAvalUniqueNick.GetText());
    this.OnEditCAUniqueNickChanged();
    this.CheckAccCreationAbility();
  }

  public AccountCreationResult(tmp: number, descr: string): void {
    this.gsMessageBox.HideDialog();

    if (descr === "") {
      this.gsCreateMbResult.InitMessageBox("message_box_gs_result");
      this.gsCreateMbResult.SetText("ui_mp_gamespy_profile_created");
      this.gsCreateMbResult.ShowDialog(true);
    } else {
      this.gsMessageBox.InitMessageBox("message_box_gs_result");
      this.gsMessageBox.SetText(descr);
      this.gsMessageBox.ShowDialog(true);
    }
  }

  public OnNickSuggestionComplete(result: number, description: string): void {
    logger.info("On nick suggestion complete:", description);

    this.gsMbCreateVnickCancel.HideDialog();
    this.createAccountButton.Enable(false);

    if (result > 0) {
      let index: number = 1;

      for (const it of this.owner.xrAccountManager.get_suggested_unicks()) {
        if (it === this.caUniqueNick.GetText()) {
          this.caStUniqueNick.InitTexture("ui_inGame2_lamp_GREEN");
          this.caUniqueNickValid = true;
          this.createAccountButton.Enable(true);
          this.caComboAvalUniqueNick.Show(false);
          this.CheckAccCreationAbility();

          return;
        }

        this.caComboAvalUniqueNick.AddItem(it, index);

        index += 1;
      }

      const firstName: TName = this.caComboAvalUniqueNick.GetTextOf(0);

      this.caComboAvalUniqueNick.SetText(firstName);
      this.caStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.gsMessageBox.InitMessageBox("message_box_gs_result");
      this.gsMessageBox.SetText("ui_mp_gamespy_verify_nickname_error1");
      this.gsMessageBox.ShowDialog(true);
      this.caUniqueNickValid = false;
    } else {
      this.caStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.gsMessageBox.InitMessageBox("message_box_gs_result");
      this.gsMessageBox.SetText(description);
      this.gsMessageBox.ShowDialog(true);
      this.caUniqueNickValid = false;
    }

    this.CheckAccCreationAbility();
  }
}
