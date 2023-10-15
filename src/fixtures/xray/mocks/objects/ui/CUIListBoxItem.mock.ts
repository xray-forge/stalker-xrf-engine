import { jest } from "@jest/globals";

import { MockCUITextWnd } from "@/fixtures/xray/mocks/objects/ui/CUITextWnd.mock";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock generic list box item.
 */
export class MockCUIListBoxItem extends MockCUIWindow {
  public textItem: MockCUITextWnd = new MockCUITextWnd();
  public textField?: MockCUITextWnd;

  public AddTextField = jest.fn((text: string) => {
    this.textField = new MockCUITextWnd();
    this.textField.SetText(text);

    return this.textField;
  });

  public GetTextItem = jest.fn(() => this.textItem);

  public SetTextColor = jest.fn();
}
