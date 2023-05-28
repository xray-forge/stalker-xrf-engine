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
import { Optional, TKeyCode, TUIEvent } from "@/engine/lib/types";

const base: string = "menu\\multiplayer\\MultiplayerLocalnet.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerLocalnet extends CUIScriptWnd {
  public owner: MainMenu;

  public loginPage!: CUIWindow;
  public loginButton!: CUI3tButton;
  public cancelButton!: CUI3tButton;

  public lpHeaderLogin!: CUITextWnd;
  public lpNickname!: CUIEditBox;
  public lpCheckRememberMe!: CUICheckButton;

  public gsLoginMessageBox!: CUIMessageBoxEx;

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

    this.loginButton = xml.Init3tButton("button_login", this);
    this.Register(this.loginButton, "btn_login");

    this.cancelButton = xml.Init3tButton("button_cancel", this);
    this.Register(this.cancelButton, "btn_cancel");

    this.loginPage = new CUIWindow();
    xml.InitWindow("login_page", 0, this.loginPage);
    this.loginPage.SetAutoDelete(true);
    this.AttachChild(this.loginPage);

    xml.InitWindow("login_page", 0, this.loginPage);
    this.lpHeaderLogin = xml.InitTextWnd("login_page:cap_header_login", this.loginPage);

    xml.InitTextWnd("login_page:cap_nickname", this.loginPage);
    this.lpNickname = xml.InitEditBox("login_page:edit_nickname", this.loginPage);
    this.Register(this.lpNickname, "lp_edit_nickname");

    this.gsLoginMessageBox = new CUIMessageBoxEx();
    this.Register(this.gsLoginMessageBox, "gs_message_box");

    this.lpCheckRememberMe = xml.InitCheck("login_page:check_remember_me", this.loginPage);
    this.Register(this.lpCheckRememberMe, "lp_check_remember_me");

    this.lpNickname.CaptureFocus(true);
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
      this.lpNickname.GetText(),
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
      this.gsLoginMessageBox.InitMessageBox("message_box_gs_result");
      this.gsLoginMessageBox.SetText(description);
      this.gsLoginMessageBox.ShowDialog(true);
    } else {
      logger.info("With profile");
      this.owner.xrGameSpyProfile = profile;

      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main_logout"
      );
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);

      if (this.lpCheckRememberMe.GetCheck()) {
        logger.info("Saving to registry:", profile === null);
        this.owner.xrLoginManager.save_nick_to_registry(profile.unique_nick());
      }

      this.HideDialog();
      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.onButtonClickMultiplayer();
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
    this.owner.xrLoginManager.save_remember_me_to_registry(this.lpCheckRememberMe.GetCheck());
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
