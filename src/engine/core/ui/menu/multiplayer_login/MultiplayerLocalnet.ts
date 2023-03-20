import {
  CScriptXmlInit,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  Frect,
  login_operation_cb,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUICheckButton,
  XR_CUIEditBox,
  XR_CUIMessageBoxEx,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_profile,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFormPath } from "@/engine/core/utils/ui";
import { Optional } from "@/engine/lib/types";

const base: string = "menu\\multiplayer\\MultiplayerLocalnet.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerLocalnet extends CUIScriptWnd {
  public owner: MainMenu;

  public login_page!: XR_CUIWindow;
  public btn_login!: XR_CUI3tButton;
  public btn_cancel!: XR_CUI3tButton;
  public lp_header_login!: XR_CUITextWnd;
  public lp_nickname!: XR_CUIEditBox;
  public gs_login_message_box!: XR_CUIMessageBoxEx;
  public lp_check_remember_me!: XR_CUICheckButton;

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
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();

    xml.ParseFile(resolveXmlFormPath(base));

    this.SetWndRect(new Frect().set(0, 0, 1024, 768));
    this.Enable(true);
    xml.InitStatic("background", this);

    this.btn_login = xml.Init3tButton("button_login", this);
    this.Register(this.btn_login, "btn_login");

    this.btn_cancel = xml.Init3tButton("button_cancel", this);
    this.Register(this.btn_cancel, "btn_cancel");

    this.login_page = new CUIWindow();
    xml.InitWindow("login_page", 0, this.login_page);
    this.login_page.SetAutoDelete(true);
    this.AttachChild(this.login_page);

    xml.InitWindow("login_page", 0, this.login_page);
    this.lp_header_login = xml.InitTextWnd("login_page:cap_header_login", this.login_page);

    xml.InitTextWnd("login_page:cap_nickname", this.login_page);
    this.lp_nickname = xml.InitEditBox("login_page:edit_nickname", this.login_page);
    this.Register(this.lp_nickname, "lp_edit_nickname");

    this.gs_login_message_box = new CUIMessageBoxEx();
    this.Register(this.gs_login_message_box, "gs_message_box");

    this.lp_check_remember_me = xml.InitCheck("login_page:check_remember_me", this.login_page);
    this.Register(this.lp_check_remember_me, "lp_check_remember_me");

    this.lp_nickname.CaptureFocus(true);
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
      this.lp_nickname.GetText(),
      new login_operation_cb(this, (profile, description) => this.loginOperationResult(profile, description))
    );
  }

  /**
   * todo: Description.
   */
  public loginOperationResult(profile: Optional<XR_profile>, description: string) {
    logger.info("Login operation result:", type(profile), type(description));

    if (profile === null) {
      logger.info("No profile");
      this.gs_login_message_box.InitMessageBox("message_box_gs_result");
      this.gs_login_message_box.SetText(description);
      this.gs_login_message_box.ShowDialog(true);
    } else {
      logger.info("With profile");
      this.owner.xrGameSpyProfile = profile;

      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main_logout"
      );
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);

      if (this.lp_check_remember_me.GetCheck()) {
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
    this.owner.xrLoginManager.save_remember_me_to_registry(this.lp_check_remember_me.GetCheck());
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
  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event) {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.onBtnCancel();
      }
    }

    return true;
  }
}
