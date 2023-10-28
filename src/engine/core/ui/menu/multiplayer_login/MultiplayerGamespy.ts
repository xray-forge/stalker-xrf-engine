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
import { createScreenRectangle } from "@/engine/core/utils/rectangle";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional, TKeyCode, TLabel, TName, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\multiplayer\\MultiplayerGamespy.component";

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

  public uiLoginPage!: CUIWindow;
  public uiCreateAccountPage!: CUIWindow;
  public uiLpHeaderLogin!: CUITextWnd;
  public uiLpForgotButton!: CUI3tButton;
  public uiLpPassword!: CUIEditBox;
  public uiLpEmail!: CUIEditBox;
  public uiLpCheckRememberMe!: CUICheckButton;
  public uiCaEmail!: CUIEditBox;
  public uiCaHeaderCreateAcc!: CUITextWnd;
  public uiCaError!: CUITextWnd;
  public uiCaPassword!: CUIEditBox;
  public uiCaStPassword!: CUIStatic;
  public uiCaStEmail!: CUIStatic;
  public uiCaConfirmPassword!: CUIEditBox;
  public uiCaStConfirmPassword!: CUIStatic;
  public uiCaUniqueNick!: CUIEditBox;
  public uiCaStUniqueNick!: CUIStatic;
  public uiCaComboAvalUniqueNick!: CUIComboBox;
  public uiCreateAccountButton!: CUI3tButton;
  public uiCreateButton!: CUI3tButton;
  public uiLoginButton!: CUI3tButton;
  public uiCancelButton!: CUI3tButton;
  public uiGsMessageBox!: CUIMessageBoxEx;
  public uiGsMbCreateVnickCancel!: CUIMessageBoxEx;
  public uiGsMbCreateVemailCancel!: CUIMessageBoxEx;
  public uiGsCreateMbResult!: CUIMessageBoxEx;
  public uiGsLoginMbResult!: CUIMessageBoxEx;
  public uiGsLoginMbProfnotfound!: CUIMessageBoxEx;
  public uiGsLoginMbCancel!: CUIMessageBoxEx;

  public constructor(owner: MainMenu) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallbacks();
  }

  public initControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(createScreenRectangle());
    this.Enable(true);
    xml.InitStatic("background", this);

    let button = null;

    button = xml.Init3tButton("button_create_acc", this);
    this.Register(button, "btn_create_acc");
    this.uiCreateAccountButton = button;

    button = xml.Init3tButton("button_create", this);
    this.Register(button, "btn_create");
    this.uiCreateButton = button;

    button = xml.Init3tButton("button_login", this);
    this.Register(button, "btn_login");
    this.uiLoginButton = button;

    button = xml.Init3tButton("button_cancel", this);
    this.Register(button, "btn_cancel");
    this.uiCancelButton = button;
    // --------------------------------------------------------------------------------
    this.uiLoginPage = new CUIWindow();
    xml.InitWindow("login_page", 0, this.uiLoginPage);
    this.uiLoginPage.SetAutoDelete(true);
    this.AttachChild(this.uiLoginPage);

    this.uiLpHeaderLogin = xml.InitTextWnd("login_page:cap_header_login", this.uiLoginPage);

    xml.InitTextWnd("login_page:cap_email", this.uiLoginPage);
    this.uiLpEmail = xml.InitEditBox("login_page:edit_email", this.uiLoginPage);
    this.Register(this.uiLpEmail, "lp_edit_email");

    xml.InitTextWnd("login_page:cap_password", this.uiLoginPage);
    this.uiLpPassword = xml.InitEditBox("login_page:edit_password", this.uiLoginPage);
    this.Register(this.uiLpPassword, "lp_edit_password");

    button = xml.Init3tButton("login_page:button_forgot", this.uiLoginPage);
    this.Register(button, "lp_btn_forgot");
    this.uiLpForgotButton = button;

    button = xml.InitCheck("login_page:check_remember_me", this.uiLoginPage);
    this.Register(button, "lp_check_remember_me");
    button.SetCheck(true);
    this.uiLpCheckRememberMe = button;

    this.uiLpEmail.SetNextFocusCapturer(this.uiLpPassword);
    this.uiLpPassword.SetNextFocusCapturer(this.uiLpEmail);
    // --------------------------------------------------------------------------------
    this.uiCreateAccountPage = new CUIWindow();
    xml.InitWindow("create_account_page", 0, this.uiCreateAccountPage);
    this.uiCreateAccountPage.SetAutoDelete(true);
    this.AttachChild(this.uiCreateAccountPage);

    this.uiCaHeaderCreateAcc = xml.InitTextWnd(
      "create_account_page:cap_header_create_account",
      this.uiCreateAccountPage
    );
    this.uiCaError = xml.InitTextWnd("create_account_page:cap_error", this.uiCreateAccountPage);

    xml.InitTextWnd("create_account_page:cap_email", this.uiCreateAccountPage);
    this.uiCaEmail = xml.InitEditBox("create_account_page:edit_email", this.uiCreateAccountPage);
    this.Register(this.uiCaEmail, "ca_edit_email");
    this.uiCaStEmail = xml.InitStatic("create_account_page:static_email", this.uiCreateAccountPage);

    xml.InitTextWnd("create_account_page:cap_password", this.uiCreateAccountPage);
    this.uiCaPassword = xml.InitEditBox("create_account_page:edit_password", this.uiCreateAccountPage);
    this.Register(this.uiCaPassword, "ca_edit_password");
    this.uiCaStPassword = xml.InitStatic("create_account_page:static_password", this.uiCreateAccountPage);

    xml.InitTextWnd("create_account_page:cap_confirm_password", this.uiCreateAccountPage);
    this.uiCaConfirmPassword = xml.InitEditBox("create_account_page:edit_confirm_password", this.uiCreateAccountPage);
    this.Register(this.uiCaConfirmPassword, "ca_edit_confirm_password");
    this.uiCaStConfirmPassword = xml.InitStatic(
      "create_account_page:static_confirm_password",
      this.uiCreateAccountPage
    );

    xml.InitTextWnd("create_account_page:cap_unique_nick", this.uiCreateAccountPage);
    this.uiCaUniqueNick = xml.InitEditBox("create_account_page:edit_unique_nick", this.uiCreateAccountPage);
    this.Register(this.uiCaUniqueNick, "ca_edit_unique_nick");
    this.uiCaStUniqueNick = xml.InitStatic("create_account_page:static_unique_nick", this.uiCreateAccountPage);

    this.uiCaComboAvalUniqueNick = xml.InitComboBox(
      "create_account_page:combo_aval_unique_nick",
      this.uiCreateAccountPage
    );
    this.Register(this.uiCaComboAvalUniqueNick, "ca_combo_aval_unique_nick");

    this.uiCaEmail.SetNextFocusCapturer(this.uiCaPassword);
    this.uiCaPassword.SetNextFocusCapturer(this.uiCaConfirmPassword);
    this.uiCaConfirmPassword.SetNextFocusCapturer(this.uiCaUniqueNick);
    this.uiCaUniqueNick.SetNextFocusCapturer(this.uiCaEmail);

    // -- // message boxes

    this.uiGsLoginMbCancel = new CUIMessageBoxEx();
    this.Register(this.uiGsLoginMbCancel, "gs_mb_login_cancel");

    this.uiGsLoginMbProfnotfound = new CUIMessageBoxEx();
    this.Register(this.uiGsLoginMbProfnotfound, "gs_mb_login_profnotfound");

    this.uiGsLoginMbResult = new CUIMessageBoxEx();
    this.Register(this.uiGsLoginMbResult, "gs_mb_login_result");

    this.uiGsCreateMbResult = new CUIMessageBoxEx();
    this.Register(this.uiGsCreateMbResult, "gs_mb_create_result");

    this.uiGsMbCreateVemailCancel = new CUIMessageBoxEx();
    this.Register(this.uiGsMbCreateVemailCancel, "gs_mb_create_vemail_cancel");

    this.uiGsMbCreateVnickCancel = new CUIMessageBoxEx();
    this.Register(this.uiGsMbCreateVnickCancel, "gs_mb_create_vnick_cancel");

    this.uiGsMessageBox = new CUIMessageBoxEx();
    this.Register(this.uiGsMessageBox, "gs_message_box");

    // -- ///////////////

    this.uiCreateAccountPage.Show(false);

    focusedEb = 0;

    this.changeActiveEditBox();
    this.checkAccCreationAbility();
  }

  public initCallbacks(): void {
    this.AddCallback("btn_create_acc", ui_events.BUTTON_CLICKED, () => this.onBtnShowCreateAccountPage(), this);
    this.AddCallback("btn_create", ui_events.BUTTON_CLICKED, () => this.onBtnCreateAccount(), this);

    this.AddCallback("btn_login", ui_events.BUTTON_CLICKED, () => this.onBtnLogin(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onBtnCancel(), this);
    this.AddCallback("lp_check_remember_me", ui_events.BUTTON_CLICKED, () => this.onBtnRememberMe(), this);

    this.AddCallback("lp_edit_email", ui_events.EDIT_TEXT_COMMIT, () => this.onEditLPEmailChanged(), this);
    this.AddCallback("lp_edit_password", ui_events.EDIT_TEXT_COMMIT, () => this.onEditLPPasswordChanged(), this);
    this.AddCallback("lp_btn_forgot", ui_events.BUTTON_CLICKED, () => this.onBtnLPForgotPassword(), this);

    this.AddCallback("ca_edit_email", ui_events.EDIT_TEXT_COMMIT, () => this.onEditCAEmailChanged(), this);
    this.AddCallback("ca_edit_password", ui_events.EDIT_TEXT_COMMIT, () => this.onEditCAPasswordChanged(), this);
    this.AddCallback(
      "ca_edit_confirm_password",
      ui_events.EDIT_TEXT_COMMIT,
      () => this.onEditCAConfirmPasswordChanged(),
      this
    );
    this.AddCallback("ca_edit_unique_nick", ui_events.EDIT_TEXT_COMMIT, () => this.onEditCAUniqueNickChanged(), this);

    this.AddCallback("ca_combo_aval_unique_nick", ui_events.LIST_ITEM_SELECT, () => this.onUniqueNickSelect(), this);
    this.AddCallback("ca_combo_aval_unique_nick", ui_events.WINDOW_LBUTTON_DOWN, () => this.onUniqueNickSelect(), this);

    this.AddCallback(
      "gs_mb_login_profnotfound",
      ui_events.MESSAGE_BOX_YES_CLICKED,
      () => this.loginProfileUseExist(),
      this
    );
    this.AddCallback(
      "gs_mb_login_profnotfound",
      ui_events.MESSAGE_BOX_NO_CLICKED,
      () => this.loginProfileNotFound(),
      this
    );
    this.AddCallback("gs_mb_login_result", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onLoginResultOk(), this);
    this.AddCallback("gs_mb_create_result", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.createdAccount(), this);

    this.AddCallback("gs_mb_login_cancel", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.terminateLogin(), this);
    this.AddCallback(
      "gs_mb_create_vemail_cancel",
      ui_events.MESSAGE_BOX_OK_CLICKED,
      () => this.terminateVerifyEmail(),
      this
    );
    this.AddCallback(
      "gs_mb_create_vnick_cancel",
      ui_events.MESSAGE_BOX_OK_CLICKED,
      () => this.terminateVerifyNick(),
      this
    );
  }

  public showLoginPage(): void {
    const mail: string = this.owner.xrLoginManager.get_email_from_registry();
    const pass: string = this.owner.xrLoginManager.get_password_from_registry();

    if (mail !== "" && pass !== "") {
      this.uiLpEmail.SetText(mail);
      this.uiLpPassword.SetText(pass);
    }

    this.uiLpCheckRememberMe.SetCheck(this.owner.xrLoginManager!.get_remember_me_from_registry());

    this.uiCreateAccountButton.Show(true);
    this.uiLoginButton.Show(true);
    this.uiCreateButton.Show(false);

    this.activePage = "login_page";
    this.uiCreateAccountPage.Show(false);
    this.uiLoginPage.Show(true);

    focusedEb = 0;
    // --    this.ChangeActiveEditBox()
  }

  public onBtnCancel(): void {
    logger.info("Button cancel");

    if (this.activePage === "create_account_page") {
      this.showLoginPage();
    } else {
      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
    }
  }

  public onBtnRememberMe(): void {
    logger.info("Button remember me");
    this.owner.xrLoginManager.save_remember_me_to_registry(this.uiLpCheckRememberMe.GetCheck());
  }

  public checkAccCreationAbility() {
    this.uiCreateButton.Enable(false);
    if (this.caEmailValid === true && this.caPasswordsValid === true && this.caUniqueNickValid === true) {
      this.uiCreateButton.Enable(true);
    }
  }

  public onBtnCreateAccount() {
    this.uiGsMessageBox.InitMessageBox("message_box_gs_acc_creation");
    this.uiGsMessageBox.SetText("ui_mp_gamespy_creating_new_profile");
    this.uiGsMessageBox.ShowDialog(true);
    this.owner.xrAccountManager.create_profile(
      this.uiCaEmail.GetText(),
      this.uiCaUniqueNick.GetText(),
      this.uiCaEmail.GetText(),
      this.uiCaPassword.GetText(),
      new account_operation_cb(this, (code, description) => this.accountCreationResult(code, description))
    );
  }

  public onBtnShowCreateAccountPage() {
    const emptyText: string = "";

    this.uiCaEmail.SetText(emptyText);
    this.uiCaPassword.SetText(emptyText);
    this.uiCaConfirmPassword.SetText(emptyText);
    this.uiCaUniqueNick.SetText(emptyText);

    this.caEmailValid = false;
    this.caPasswordsValid = false;
    this.caUniqueNickValid = false;

    this.uiCaStEmail.InitTexture("ui_inGame2_lamp_OFF");
    this.uiCaStPassword.InitTexture("ui_inGame2_lamp_OFF");
    this.uiCaStConfirmPassword.InitTexture("ui_inGame2_lamp_OFF");
    this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_OFF");

    this.uiCaError.SetText(emptyText);

    this.uiCreateAccountButton.Enable(false);
    this.activePage = "create_account_page";
    this.uiCreateAccountPage.Show(true);
    this.uiCreateAccountButton.Show(false);
    this.uiCaComboAvalUniqueNick.Show(false);
    this.uiCaComboAvalUniqueNick.ClearList();
    this.uiLoginButton.Show(false);
    this.uiCreateButton.Show(true);
    this.uiLoginPage.Show(false);

    focusedEb = 0;

    this.changeActiveEditBox();
    this.checkAccCreationAbility();
  }

  public onBtnLogin(): void {
    this.email = this.uiLpEmail.GetText();
    this.password = this.uiLpPassword.GetText();
    this.uiGsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.uiGsLoginMbCancel.SetText("ui_mp_gamespy_getting_account_profiles");
    this.uiGsLoginMbCancel.ShowDialog(true);
    this.profileName = "";
    this.owner.xrAccountManager.search_for_email(
      this.email,
      new found_email_cb(this, (found, description) => this.onLoginEmailSearchComplete(found, description))
    );
  }

  public onLoginEmailSearchComplete(found: boolean, description: string) {
    if (!found) {
      this.uiGsLoginMbCancel.HideDialog();
      this.uiGsLoginMbResult.InitMessageBox("message_box_gs_result");
      if (description === "") {
        description = game.translate_string("mp_gp_unknown_email");
      }

      this.uiGsLoginMbResult.SetText(description);
      this.uiGsLoginMbResult.ShowDialog(true);

      return;
    }

    this.owner.xrAccountManager.get_account_profiles(
      this.email,
      this.password,
      new account_profiles_cb(this, (code, description) => this.getAccountProfilesResult(code, description))
    );
  }

  public getAccountProfilesResult(profilesCount: number, description: string): void {
    logger.info("Got profiles response:", type(profilesCount), description);

    if (profilesCount === 0) {
      this.uiGsLoginMbCancel.HideDialog();
      this.uiGsLoginMbResult.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = game.translate_string("mp_gp_bad_password");
      }

      logger.info("Failed to login: ", description);

      this.uiGsLoginMbResult.SetText(description);
      this.uiGsLoginMbResult.ShowDialog(true);
    } else {
      for (const it of this.owner.xrAccountManager.get_found_profiles()) {
        if (this.profileName === "") {
          this.profileName = it;
        }

        if (it === this.email) {
          this.uiGsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
          this.owner.xrLoginManager.login(
            this.email,
            // todo: Maybe typo.
            this.email,
            this.password,
            new login_operation_cb(this, (code, description) => this.loginOperationResult(code, description))
          );

          return;
        }
      }

      this.uiGsLoginMbCancel.HideDialog();
      this.loginProfileUseExist();

      // --this.gs_login_mb_profnotfound.InitMessageBox("message_box_gs_question");
      // --this.gs_login_mb_profnotfound.SetText(game.translate_string("ui_mp_gamespy_use_existing_profile") +
      // " " + this.profile_name + "?");
      // --this.gs_login_mb_profnotfound.ShowDialog(true);
    }
  }

  public loginOperationResult(profile: Optional<profile>, description: string) {
    logger.info("Login operation result:", type(profile), description);
    this.uiGsLoginMbCancel.HideDialog();

    if (profile === null) {
      logger.info("Login failed");

      this.uiGsLoginMbResult.InitMessageBox("message_box_gs_result");

      if (description === "") {
        description = "mp_gp_login_error";
      }

      this.uiGsLoginMbResult.SetText(description);
      this.uiGsLoginMbResult.ShowDialog(true);
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
        new store_operation_cb(this, (code, description) => this.loadingProgress(code, description)),
        new store_operation_cb(this, (code, description) => this.loadingComplete(code, description))
      );

      if (this.uiLpCheckRememberMe.GetCheck()) {
        this.owner.xrLoginManager.save_email_to_registry(this.email);
        this.owner.xrLoginManager.save_password_to_registry(this.password);
      }
    }
  }

  public terminateLogin(): void {
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

  public loginProfileUseExist(): void {
    logger.info("Profile use existing");

    this.uiGsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.uiGsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.uiGsLoginMbCancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profileName,
      this.password,
      new login_operation_cb(this, (profile, description) => this.loginOperationResult(profile, description))
    );
  }

  public loginProfileNotFound(): void {
    this.onBtnShowCreateAccountPage();
  }

  public onLoginResultOk(): void {
    if (this.owner.xrGameSpyProfile) {
      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.onMultiplayerButtonClick();
    }
  }

  public createdAccount(): void {
    this.showLoginPage();
    this.uiLpEmail.SetText(this.uiCaEmail.GetText());
    this.uiLpPassword.SetText(this.uiCaPassword.GetText());
    // --this.OnBtnLogin();
  }

  public onMsgYes(): void {
    this.uiGsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.uiGsLoginMbCancel.SetText("ui_mp_gamespy_logining_to_profile");
    this.uiGsLoginMbCancel.ShowDialog(true);
    this.owner.xrLoginManager.login(
      this.email,
      this.profileName,
      this.password,
      new login_operation_cb(this, (profile, description) => this.loginOperationResult(profile, description))
    );
  }

  public onMsgNo() {
    this.uiCaEmail.SetText(this.email);
    this.uiCaStEmail.InitTexture("ui_inGame2_lamp_GREEN");
    this.uiCaPassword.SetText(this.password);
    this.uiCaStPassword.InitTexture("ui_inGame2_lamp_GREEN");
    this.uiCaConfirmPassword.SetText(this.password);
    this.uiCaStConfirmPassword.InitTexture("ui_inGame2_lamp_GREEN");
    this.onBtnShowCreateAccountPage();
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
        this.onBtnCancel();
      } else if (key === DIK_keys.DIK_TAB) {
        if (ctrl) {
          if (this.activePage === "login_page") {
            this.onBtnShowCreateAccountPage();
          } else {
            this.onBtnLogin();
          }
        }
      }
    }

    return true;
  }

  public onEditLPEmailChanged(): void {
    // --this.OnBtnLogin();
  }

  public onEditLPPasswordChanged(): void {
    // --this.OnBtnLogin();
  }

  public onBtnLPForgotPassword(): void {
    this.owner.xrLoginManager.forgot_password("https://login.gamespy.com/lostpassword.aspx");
  }

  public loadingProgress(fakeBool: any, progressString: string) {
    if (this.uiGsLoginMbCancel.IsShown()) {
      this.uiGsLoginMbCancel.HideDialog();
    }

    this.uiGsLoginMbCancel.InitMessageBox("message_box_gs_info");
    this.uiGsLoginMbCancel.SetText(progressString);
    this.uiGsLoginMbCancel.ShowDialog(true);
  }

  public loadingComplete(loadResult: number | boolean, descr: string): void {
    this.uiGsLoginMbCancel.HideDialog();
    this.uiGsLoginMbResult.InitMessageBox("message_box_gs_result");

    if (loadResult === true) {
      const tmpUnick: TName = this.owner.xrGameSpyProfile!.unique_nick();
      let helloText: TLabel = game.translate_string("ui_mp_gamespy_loading_rewards_hello") + " " + tmpUnick + "!";

      if (tmpUnick === "@unregistered") {
        helloText = game.translate_string("mp_gp_unique_nick_not_registred");
      }

      if (tmpUnick === "@expired") {
        helloText = game.translate_string("mp_gp_unique_nick_has_expired");
      }

      this.uiGsLoginMbResult.SetText(helloText);
    } else {
      this.uiGsLoginMbResult.SetText(descr);
    }

    this.uiGsLoginMbResult.ShowDialog(true);
  }

  public changeActiveEditBox(): void {
    this.uiLpEmail.CaptureFocus(false);
    this.uiLpPassword.CaptureFocus(false);
    this.uiCaEmail.CaptureFocus(false);
    this.uiCaPassword.CaptureFocus(false);
    this.uiCaConfirmPassword.CaptureFocus(false);
    this.uiCaUniqueNick.CaptureFocus(false);

    if (this.activePage === "login_page") {
      this.uiLpEmail.CaptureFocus(true);
    } else {
      this.uiCaPassword.CaptureFocus(true);
    }
  }

  public onEditCAEmailChanged(): void {
    const email: TName = this.uiCaEmail.GetText();

    if (email !== "") {
      if (this.owner.xrAccountManager.verify_email(email)) {
        this.uiGsMbCreateVemailCancel.InitMessageBox("message_box_gs_info");
        this.uiGsMbCreateVemailCancel.SetText("ui_mp_gamespy_verify_email");
        this.uiGsMbCreateVemailCancel.ShowDialog(true);
        this.owner.xrAccountManager.search_for_email(
          this.uiCaEmail.GetText(),
          new found_email_cb(this, (found, description) => this.onEmailSearchComplete(found, description))
        );
      } else {
        this.uiCaStEmail.InitTexture("ui_inGame2_lamp_RED");
        this.uiCaError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      }
    }

    this.checkAccCreationAbility();
  }

  public onEditCAPasswordChanged(): void {
    const pass: string = this.uiCaPassword.GetText();

    if (this.owner.xrAccountManager.verify_password(pass)) {
      this.uiCaStPassword.InitTexture("ui_inGame2_lamp_GREEN");
      this.uiCaError.SetText("");
    } else {
      this.uiCaStPassword.InitTexture("ui_inGame2_lamp_RED");
      this.uiCaError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
      this.caPasswordsValid = false;
    }

    this.checkAccCreationAbility();
  }

  public onEditCAConfirmPasswordChanged(): void {
    const pass: string = this.uiCaPassword.GetText();
    const confPass: string = this.uiCaConfirmPassword.GetText();

    if (pass === confPass) {
      if (this.owner.xrAccountManager.verify_password(pass)) {
        this.uiCaStConfirmPassword.InitTexture("ui_inGame2_lamp_GREEN");
        this.uiCaError.SetText("");
        this.caPasswordsValid = true;
      } else {
        this.uiCaStConfirmPassword.InitTexture("ui_inGame2_lamp_RED");
        this.uiCaError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
        this.caPasswordsValid = false;
      }
    } else {
      this.uiCaStConfirmPassword.InitTexture("ui_inGame2_lamp_RED");
      this.uiCaError.SetText(game.translate_string("ui_mp_gamespy_verify_password_error1"));
      this.caPasswordsValid = false;
    }

    this.checkAccCreationAbility();
  }

  public onEditCAUniqueNickChanged(): void {
    const nick: TName = this.uiCaUniqueNick.GetText();

    if (this.owner.xrAccountManager.verify_unique_nick(nick)) {
      this.uiGsMbCreateVnickCancel.InitMessageBox("message_box_gs_info");
      this.uiGsMbCreateVnickCancel.SetText("ui_mp_gamespy_suggesting_unique_name");
      this.uiGsMbCreateVnickCancel.ShowDialog(true);
      this.owner.xrAccountManager.suggest_unique_nicks(
        nick,
        new suggest_nicks_cb(this, (code: number, description: string) => {
          this.onNickSuggestionComplete(code, description);
        })
      );
      this.uiCaComboAvalUniqueNick.Show(true);
      this.uiCaComboAvalUniqueNick.ClearList();
    } else {
      this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.uiCaError.SetText(game.translate_string(this.owner.xrAccountManager.get_verify_error_descr()));
    }
  }

  public terminateVerifyEmail(): void {
    this.owner.xrAccountManager.stop_searching_email();
    this.uiCaStEmail.InitTexture("ui_inGame2_lamp_RED");
    this.caEmailValid = false;
  }

  public onEmailSearchComplete(found: boolean, description: string): void {
    this.uiGsMbCreateVemailCancel.HideDialog();

    if (found) {
      this.uiCaStEmail.InitTexture("ui_inGame2_lamp_RED");
      this.uiCaError.SetText(game.translate_string("ui_mp_gamespy_email_already_exist"));
      this.caEmailValid = false;
    } else {
      this.uiCaStEmail.InitTexture("ui_inGame2_lamp_GREEN");
      this.uiCaError.SetText("");
      this.caEmailValid = true;
    }

    this.checkAccCreationAbility();
  }

  public terminateVerifyNick(): void {
    this.owner.xrAccountManager.stop_suggest_unique_nicks();
    this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
    this.caUniqueNickValid = false;
  }

  public onUniqueNickSelect(): void {
    this.uiCaUniqueNick.SetText(this.uiCaComboAvalUniqueNick.GetText());
    this.onEditCAUniqueNickChanged();
    this.checkAccCreationAbility();
  }

  public accountCreationResult(tmp: number, descr: string): void {
    this.uiGsMessageBox.HideDialog();

    if (descr === "") {
      this.uiGsCreateMbResult.InitMessageBox("message_box_gs_result");
      this.uiGsCreateMbResult.SetText("ui_mp_gamespy_profile_created");
      this.uiGsCreateMbResult.ShowDialog(true);
    } else {
      this.uiGsMessageBox.InitMessageBox("message_box_gs_result");
      this.uiGsMessageBox.SetText(descr);
      this.uiGsMessageBox.ShowDialog(true);
    }
  }

  public onNickSuggestionComplete(result: number, description: string): void {
    logger.info("On nick suggestion complete:", description);

    this.uiGsMbCreateVnickCancel.HideDialog();
    this.uiCreateAccountButton.Enable(false);

    if (result > 0) {
      let index: number = 1;

      for (const it of this.owner.xrAccountManager.get_suggested_unicks()) {
        if (it === this.uiCaUniqueNick.GetText()) {
          this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_GREEN");
          this.caUniqueNickValid = true;
          this.uiCreateAccountButton.Enable(true);
          this.uiCaComboAvalUniqueNick.Show(false);
          this.checkAccCreationAbility();

          return;
        }

        this.uiCaComboAvalUniqueNick.AddItem(it, index);

        index += 1;
      }

      const firstName: TName = this.uiCaComboAvalUniqueNick.GetTextOf(0);

      this.uiCaComboAvalUniqueNick.SetText(firstName);
      this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.uiGsMessageBox.InitMessageBox("message_box_gs_result");
      this.uiGsMessageBox.SetText("ui_mp_gamespy_verify_nickname_error1");
      this.uiGsMessageBox.ShowDialog(true);
      this.caUniqueNickValid = false;
    } else {
      this.uiCaStUniqueNick.InitTexture("ui_inGame2_lamp_RED");
      this.uiGsMessageBox.InitMessageBox("message_box_gs_result");
      this.uiGsMessageBox.SetText(description);
      this.uiGsMessageBox.ShowDialog(true);
      this.caUniqueNickValid = false;
    }

    this.checkAccCreationAbility();
  }
}
