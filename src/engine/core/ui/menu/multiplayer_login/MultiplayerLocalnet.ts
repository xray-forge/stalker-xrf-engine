import {
  CScriptXmlInit,
  CUICheckButton,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  login_operation_cb,
  LuabindClass,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createRectangle } from "@/engine/core/utils/rectangle";
import { EElementType, initializeElement, resolveXmlFile, resolveXmlFormPath } from "@/engine/core/utils/ui";
import { screenConfig } from "@/engine/lib/configs/ScreenConfig";
import { Optional, Profile, TKeyCode, TLabel, TPath, TUIEvent } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "menu\\multiplayer\\MultiplayerLocalnet.component";

/**
 * Window displayed when suggesting login for play in local network.
 */
@LuabindClass()
export class MultiplayerLocalnet extends CUIScriptWnd {
  public owner: MainMenu;

  public uiLoginPage!: CUIWindow;
  public uiNicknameEditBox!: CUIEditBox;
  public uiRememberMeCheck!: CUICheckButton;

  public uiGsLoginMessageBox!: CUIMessageBoxEx;

  public constructor(owner: MainMenu) {
    super();

    this.owner = owner;

    this.initialize();
  }

  /**
   * Initialize components and callback handlers.
   */
  public initialize(): void {
    const xml: CScriptXmlInit = resolveXmlFile(base);

    this.SetWndRect(createRectangle(0, 0, screenConfig.BASE_WIDTH, screenConfig.BASE_HEIGHT));
    this.Enable(true);

    initializeElement(xml, EElementType.STATIC, "background", this);

    initializeElement(xml, EElementType.BUTTON, "button_login", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onLoginButtonClick(),
    });

    initializeElement(xml, EElementType.BUTTON, "button_cancel", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClick(),
    });

    this.uiGsLoginMessageBox = initializeElement(xml, EElementType.MESSAGE_BOX_EX, "gs_message_box", this, {
      [ui_events.MESSAGE_BOX_OK_CLICKED]: () => this.onOkMessageClick(),
    });

    const uiLoginPage: CUIWindow = new CUIWindow();

    xml.InitWindow("login_page", 0, uiLoginPage);

    this.AttachChild(uiLoginPage);
    this.uiLoginPage = uiLoginPage;
    this.uiLoginPage.SetAutoDelete(true);

    initializeElement(xml, EElementType.TEXT_WINDOW, "login_page:cap_header_login", uiLoginPage);
    initializeElement(xml, EElementType.TEXT_WINDOW, "login_page:cap_nickname", uiLoginPage);

    this.uiNicknameEditBox = initializeElement(xml, EElementType.EDIT_BOX, "login_page:edit_nickname", uiLoginPage, {
      context: this,
      [ui_events.EDIT_TEXT_COMMIT]: () => this.onNicknameEditBoxChanged(),
    });
    this.uiNicknameEditBox.CaptureFocus(true);

    this.uiRememberMeCheck = initializeElement(
      xml,
      EElementType.CHECK_BUTTON,
      "login_page:check_remember_me",
      uiLoginPage,
      {
        context: this,
        [ui_events.BUTTON_CLICKED]: () => this.onRememberMeButtonClick(),
      }
    );
  }

  /**
   * Handle `login` button click.
   */
  public onLoginButtonClick(): void {
    logger.info("On button login");

    this.owner.xrLoginManager.login_offline(
      this.uiNicknameEditBox.GetText(),
      new login_operation_cb(this, (profile, description) => this.onLoginOperationResult(profile, description))
    );
  }

  /**
   * Clicked OK in login fail modal.
   */
  public onOkMessageClick(): void {
    logger.info("On message ok clicked");
  }

  /**
   * Clicked cancel button / clicked escape.
   */
  public onCancelButtonClick(): void {
    logger.info("On button cancel click");

    this.HideDialog();
    this.owner.ShowDialog(true);
    this.owner.Show(true);
  }

  /**
   * Toggle `remember me` checkbox.
   */
  public onRememberMeButtonClick(): void {
    logger.info("On button remember me toggle");
    this.owner.xrLoginManager.save_remember_me_to_registry(this.uiRememberMeCheck.GetCheck());
  }

  /**
   * Confirmed edit of nickname.
   */
  public onNicknameEditBoxChanged(): void {
    this.onLoginButtonClick();
  }

  /**
   * Handle login result.
   *
   * @param profile - resulting profile after login operation
   * @param description - description of operation result
   */
  public onLoginOperationResult(profile: Optional<Profile>, description: TLabel): void {
    logger.info("Login operation result:", type(profile), description);

    if (profile) {
      logger.info("With profile, successful login:", profile.unique_nick());
      this.owner.xrGameSpyProfile = profile;

      this.owner.xrMenuPageController.SetPage(
        CUIMMShniaga.epi_main,
        resolveXmlFormPath("menu\\MainMenu.component"),
        "menu_main_logout"
      );
      this.owner.xrMenuPageController.ShowPage(CUIMMShniaga.epi_main);

      if (this.uiRememberMeCheck.GetCheck()) {
        logger.info("Saving to registry");
        this.owner.xrLoginManager.save_nick_to_registry(profile.unique_nick());
      }

      this.HideDialog();

      this.owner.ShowDialog(true);
      this.owner.Show(true);
      this.owner.onMultiplayerButtonClick();
    } else {
      logger.info("No profile, login failed");

      this.uiGsLoginMessageBox.InitMessageBox("message_box_gs_result");
      this.uiGsLoginMessageBox.SetText(description);
      this.uiGsLoginMessageBox.ShowDialog(true);
    }
  }

  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE:
          this.onCancelButtonClick();
          break;
      }
    }

    return true;
  }
}
