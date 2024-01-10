import { CUIScriptWnd, CUIStatic, DIK_keys, LuabindClass, ui_events } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement, resolveXmlFile } from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { Optional, TKeyCode, TLabel, TPath, TUIEvent, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const base: TPath = "game\\NumPadWindow.component";

export interface INumPadWindowOwner {
  onNumberReceive(text: string): void;
}

/**
 * Custom window to enter password.
 * Shown to open locks/doors etc. when custom password scheme logics is active.
 */
@LuabindClass()
export class NumPadWindow extends CUIScriptWnd {
  public owner: Optional<INumPadWindowOwner>;

  public uiEditBox!: CUIStatic;

  public constructor(owner: Optional<INumPadWindowOwner>) {
    super();

    logger.format("Initialize new numpad");

    this.owner = owner;

    this.initialize();
  }

  /**
   * Initialize UI and positioning.
   * Subscribe to UI events.
   */
  public initialize(): void {
    this.SetWndPos(create2dVector(342, 199));
    this.SetWndSize(create2dVector(339, 369));

    const xml: XmlInit = resolveXmlFile(base);

    xml.InitStatic("background", this);

    this.uiEditBox = xml.InitStatic("edit_box", this);
    this.uiEditBox.SetWindowName(NumPadWindow.__name);

    initializeElement(xml, EElementType.BUTTON, "btn_0", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(0),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_1", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(1),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_2", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(2),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_3", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(3),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_4", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(4),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_5", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(5),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_6", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(6),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_7", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(7),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_8", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(8),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_9", this, {
      [ui_events.BUTTON_CLICKED]: () => this.addNumber(9),
    });

    initializeElement(xml, EElementType.BUTTON, "btn_c", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onOkButtonClicked(),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_cancel", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onCancelButtonClicked(),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_enter", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onOkButtonClicked(),
    });
    initializeElement(xml, EElementType.BUTTON, "btn_backspase", this, {
      [ui_events.BUTTON_CLICKED]: () => this.onBackspaceButtonClicked(),
    });
  }

  /**
   * Handle input of number value from input window.
   *
   * @param number - value to add as input
   */
  public addNumber(number: number): void {
    const text: TLabel = this.uiEditBox.TextControl().GetText() ?? "";

    if (string.len(text) < 12) {
      this.uiEditBox.TextControl().SetText(text + number);
    }
  }

  /**
   * Clear last input from end.
   */
  public onBackspaceButtonClicked(): void {
    const text: Optional<TLabel> = this.uiEditBox.TextControl().GetText() as Optional<TLabel>;

    if (!text) {
      return;
    }

    const start: number = 1;
    const end: number = string.len(text) - 1;

    this.uiEditBox.TextControl().SetText(string.sub(text, start, end));
  }

  /**
   * Clear password entry.
   */
  public onCButtonClicked(): void {
    this.uiEditBox.TextControl().SetText("");
  }

  /**
   * Clear number and close entry window.
   */
  public onCancelButtonClicked(): void {
    logger.format("Cancel clicked");

    if (this.owner) {
      this.owner.onNumberReceive("");
    }

    this.HideDialog();
  }

  /**
   * Confirm number and fire callbacks to handle verification.
   */
  public onOkButtonClicked(): void {
    logger.format("OK clicked");

    this.HideDialog();

    const text: TLabel = this.uiEditBox.TextControl().GetText();

    if (this.owner) {
      this.owner.onNumberReceive(text);
    }
  }

  /**
   * Handle keyboard events for custom password window.
   *
   * @param key - key code
   * @param event - game event
   */
  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      switch (key) {
        case DIK_keys.DIK_ESCAPE:
          this.HideDialog();
          break;

        case DIK_keys.DIK_0:
        case DIK_keys.DIK_NUMPAD0:
          this.addNumber(0);
          break;

        case DIK_keys.DIK_1:
        case DIK_keys.DIK_NUMPAD1:
          this.addNumber(1);
          break;

        case DIK_keys.DIK_2:
        case DIK_keys.DIK_NUMPAD2:
          this.addNumber(2);
          break;

        case DIK_keys.DIK_3:
        case DIK_keys.DIK_NUMPAD3:
          this.addNumber(3);
          break;

        case DIK_keys.DIK_4:
        case DIK_keys.DIK_NUMPAD4:
          this.addNumber(4);
          break;

        case DIK_keys.DIK_5:
        case DIK_keys.DIK_NUMPAD5:
          this.addNumber(5);
          break;

        case DIK_keys.DIK_6:
        case DIK_keys.DIK_NUMPAD6:
          this.addNumber(6);
          break;

        case DIK_keys.DIK_7:
        case DIK_keys.DIK_NUMPAD7:
          this.addNumber(7);
          break;
        case DIK_keys.DIK_8:
        case DIK_keys.DIK_NUMPAD8:
          this.addNumber(8);
          break;

        case DIK_keys.DIK_9:
        case DIK_keys.DIK_NUMPAD9:
          this.addNumber(9);
          break;

        case DIK_keys.DIK_BACK:
          this.onBackspaceButtonClicked();
          break;

        case DIK_keys.DIK_RETURN:
        case DIK_keys.DIK_NUMPADENTER:
          this.onOkButtonClicked();
          break;

        case DIK_keys.DIK_DELETE:
        case DIK_keys.DIK_NUMPADCOMMA:
          this.onCButtonClicked();
          break;
      }
    }

    return true;
  }
}
