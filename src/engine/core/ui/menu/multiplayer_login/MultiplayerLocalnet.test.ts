import { describe, expect, it, jest } from "@jest/globals";
import {
  CUICheckButton,
  CUIEditBox,
  CUIMessageBoxEx,
  CUIMMShniaga,
  CUIScriptWnd,
  CUIWindow,
  DIK_keys,
  login_operation_cb,
  ui_events,
} from "xray16";

import { MainMenu } from "@/engine/core/ui/menu";
import { MultiplayerLocalnet } from "@/engine/core/ui/menu/multiplayer_login/MultiplayerLocalnet";
import { Profile } from "@/engine/lib/types";
import { MockCUIMMShniaga, MockProfile } from "@/fixtures/xray";
import { MockLoginManager } from "@/fixtures/xray/mocks/managers/LoginManager.mock";

describe("MultiplayerLocalnet", () => {
  it("should correctly initialize", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);

    expect(multiplayerLocalnet.owner).toBe(owner);
    expect(multiplayerLocalnet.uiLoginPage).toBeInstanceOf(CUIWindow);
    expect(multiplayerLocalnet.uiNicknameEditBox).toBeInstanceOf(CUIEditBox);
    expect(multiplayerLocalnet.uiRememberMeCheck).toBeInstanceOf(CUICheckButton);
    expect(multiplayerLocalnet.uiGsLoginMessageBox).toBeInstanceOf(CUIMessageBoxEx);

    expect(multiplayerLocalnet.uiNicknameEditBox.CaptureFocus).toHaveBeenCalledWith(true);
  });

  it("should correctly handle login", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);

    owner.xrLoginManager = MockLoginManager.mock();
    multiplayerLocalnet.uiNicknameEditBox.SetText("test_name");

    multiplayerLocalnet.onLoginButtonClick();

    expect(owner.xrLoginManager.login_offline).toHaveBeenCalledWith("test_name", expect.any(login_operation_cb));
  });

  it("should correctly handle message box OK", () => {
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(new CUIScriptWnd() as MainMenu);

    multiplayerLocalnet.onOkMessageClick();
  });

  it("should correctly cancel button", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);

    jest.spyOn(multiplayerLocalnet, "HideDialog").mockImplementation(jest.fn());
    jest.spyOn(owner, "ShowDialog").mockImplementation(jest.fn());
    jest.spyOn(owner, "Show").mockImplementation(jest.fn());

    multiplayerLocalnet.onCancelButtonClick();

    expect(multiplayerLocalnet.HideDialog).toHaveBeenCalled();
    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(owner.Show).toHaveBeenCalledWith(true);
  });

  it("should correctly remember me toggle", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);

    owner.xrLoginManager = MockLoginManager.mock();

    multiplayerLocalnet.uiRememberMeCheck.SetCheck(true);
    multiplayerLocalnet.onRememberMeButtonClick();

    expect(owner.xrLoginManager.save_remember_me_to_registry).toHaveBeenCalledWith(true);

    multiplayerLocalnet.uiRememberMeCheck.SetCheck(false);
    multiplayerLocalnet.onRememberMeButtonClick();

    expect(owner.xrLoginManager.save_remember_me_to_registry).toHaveBeenCalledWith(false);
  });

  it("should correctly handle nickname submit", () => {
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(new CUIScriptWnd() as MainMenu);

    jest.spyOn(multiplayerLocalnet, "onLoginButtonClick").mockImplementation(jest.fn());

    multiplayerLocalnet.onNicknameEditBoxChanged();

    expect(multiplayerLocalnet.onLoginButtonClick).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle failed login", () => {
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(new CUIScriptWnd() as MainMenu);

    multiplayerLocalnet.onLoginOperationResult(null, "login_failed");

    expect(multiplayerLocalnet.uiGsLoginMessageBox.InitMessageBox).toHaveBeenCalledWith("message_box_gs_result");
    expect(multiplayerLocalnet.uiGsLoginMessageBox.SetText).toHaveBeenCalledWith("login_failed");
    expect(multiplayerLocalnet.uiGsLoginMessageBox.ShowDialog).toHaveBeenCalledWith(true);
  });

  it("should correctly handle successful login", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);
    const profile: Profile = MockProfile.mock("test-name");

    jest.spyOn(multiplayerLocalnet, "HideDialog").mockImplementation(jest.fn());
    jest.spyOn(owner, "ShowDialog").mockImplementation(jest.fn());
    jest.spyOn(owner, "Show").mockImplementation(jest.fn());

    owner.onMultiplayerButtonClick = jest.fn();
    owner.xrMenuPageController = MockCUIMMShniaga.mock();
    owner.xrLoginManager = MockLoginManager.mock();

    multiplayerLocalnet.uiRememberMeCheck.SetCheck(true);
    multiplayerLocalnet.onLoginOperationResult(profile, "login_ok");

    expect(owner.xrGameSpyProfile).toBe(profile);
    expect(owner.xrMenuPageController.SetPage).toHaveBeenCalledWith(
      CUIMMShniaga.epi_main,
      "menu\\MainMenu.component.xml",
      "menu_main_logout"
    );
    expect(owner.xrMenuPageController.ShowPage).toHaveBeenCalledWith(CUIMMShniaga.epi_main);
    expect(owner.xrLoginManager.save_nick_to_registry).toHaveBeenCalledWith("test-name");
    expect(multiplayerLocalnet.HideDialog).toHaveBeenCalled();
    expect(owner.ShowDialog).toHaveBeenCalledWith(true);
    expect(owner.Show).toHaveBeenCalledWith(true);
    expect(owner.onMultiplayerButtonClick).toHaveBeenCalled();
  });

  it("should correctly handle keyboard events", () => {
    const owner: MainMenu = new CUIScriptWnd() as MainMenu;
    const multiplayerLocalnet: MultiplayerLocalnet = new MultiplayerLocalnet(owner);

    jest.spyOn(multiplayerLocalnet, "onCancelButtonClick");

    multiplayerLocalnet.OnKeyboard(DIK_keys.DIK_F11, ui_events.WINDOW_KEY_PRESSED);
    expect(multiplayerLocalnet.onCancelButtonClick).not.toHaveBeenCalled();

    multiplayerLocalnet.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_LBUTTON_UP);
    expect(multiplayerLocalnet.onCancelButtonClick).not.toHaveBeenCalled();

    multiplayerLocalnet.OnKeyboard(DIK_keys.DIK_ESCAPE, ui_events.WINDOW_KEY_PRESSED);
    expect(multiplayerLocalnet.onCancelButtonClick).toHaveBeenCalled();
  });
});
