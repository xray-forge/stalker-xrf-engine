import {
  CScriptXmlInit,
  CUI3tButton,
  CUICheckButton,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUITextWnd,
  CUIWindow,
  DIK_keys,
  Frect,
  login_operation_cb,
  LuabindClass,
  profile,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional, TKeyCode, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\multiplayer\\MultiplayerLocalnet.component";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerLocalnet extends CUIScriptWnd {
  public owner: MainMenu;

  public uiLoginPage!: CUIWindow;
  public uiLoginButton!: CUI3tButton;
  public uiCancelButton!: CUI3tButton;

  public uiLpHeaderLogin!: CUITextWnd;
  public uiLpNickname!: CUIEditBox;
  public uiLpCheckRememberMe!: CUICheckButton;

  public uiGsLoginMessageBox!: CUIMessageBoxEx;

  /**
   * todo: Description.
   */
  public constructor(owner: MainMenu) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallbacks();
  }

  /**
   * todo: Description.
   */
  public initControls(): void {
    const xml: CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);
    xml.InitStatic("background", this);

    this.uiLoginButton = xml.Init3tButton("button_login", this);
    this.Register(this.uiLoginButton, "btn_login");

    this.uiCancelButton = xml.Init3tButton("button_cancel", this);
    this.Register(this.uiCancelButton, "btn_cancel");

    this.uiLoginPage = new CUIWindow();
    xml.InitWindow("login_page", 0, this.uiLoginPage);
    this.uiLoginPage.SetAutoDelete(true);
    this.AttachChild(this.uiLoginPage);

    xml.InitWindow("login_page", 0, this.uiLoginPage);
    this.uiLpHeaderLogin = xml.InitTextWnd("login_page:cap_header_login", this.uiLoginPage);

    xml.InitTextWnd("login_page:cap_nickname", this.uiLoginPage);
    this.uiLpNickname = xml.InitEditBox("login_page:edit_nickname", this.uiLoginPage);
    this.Register(this.uiLpNickname, "lp_edit_nickname");

    this.uiGsLoginMessageBox = new CUIMessageBoxEx();
    this.Register(this.uiGsLoginMessageBox, "gs_message_box");

    this.uiLpCheckRememberMe = xml.InitCheck("login_page:check_remember_me", this.uiLoginPage);
    this.Register(this.uiLpCheckRememberMe, "lp_check_remember_me");

    this.uiLpNickname.CaptureFocus(true);
  }

  /**
   * todo: Description.
   */
  public initCallbacks(): void {
    this.AddCallback("btn_login", ui_events.BUTTON_CLICKED, () => this.onBtnLogin(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onBtnCancel(), this);
    this.AddCallback("lp_check_remember_me", ui_events.BUTTON_CLICKED, () => this.onBtnRememberMe(), this);
    this.AddCallback("lp_edit_nickname", ui_events.EDIT_TEXT_COMMIT, () => this.onEditLPNicknameChanged(), this);
    this.AddCallback("gs_message_box", ui_events.MESSAGE_BOX_OK_CLICKED, () => this.onMsgOk(), this);
  }

  /**
   * todo: Description.
   */
  public onBtnLogin(): void {
    logger.info("On button login");

    this.owner.xrLoginManager.login_offline(
      this.uiLpNickname.GetText(),
      new login_operation_cb(this, (profile, description) => this.loginOperationResult(profile, description))
    );
  }

  /**
   * todo: Description.
   */
  public loginOperationResult(profile: Optional<profile>, description: string) {
    logger.info("Login operation result:", type(profile), type(description));

    if (profile === null) {
      logger.info("No profile");
      this.uiGsLoginMessageBox.InitMessageBox("message_box_gs_result");
      this.uiGsLoginMessageBox.SetText(description);
      this.uiGsLoginMessageBox.ShowDialog(true);
    } else {
      logger.info("With profile");
      this.owner.xrGameSpyProfile = profile;

      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main_logout"
      );
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);

      if (this.uiLpCheckRememberMe.GetCheck()) {
        logger.info("Saving to registry:", profile === null);
        this.owner.xrLoginManager.save_nick_to_registry(profile.unique_nick());
      }

      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.onMultiplayerButtonClick();
    }
  }

  /**
   * todo: Description.
   */
  public onMsgOk(): void {
    logger.info("On message ok");
  }

  /**
   * todo: Description.
   */
  public onBtnCancel(): void {
    logger.info("On button cancel");
    this.HideDialog();
    this.owner.ShowDialog(true);
    this.owner.Show(true);
  }

  /**
   * todo: Description.
   */
  public onBtnRememberMe(): void {
    logger.info("On button remember me");
    this.owner.xrLoginManager.save_remember_me_to_registry(this.uiLpCheckRememberMe.GetCheck());
  }

  /**
   * todo: Description.
   */
  public onEditLPNicknameChanged(): void {
    this.onBtnLogin();
  }

  /**
   * todo: Description.
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent) {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onBtnCancel();
      }
    }

    return true;
  }
}
