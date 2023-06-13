import { CScriptXmlInit, CUIScriptWnd, CUIStatic, DIK_keys, LuabindClass, ui_events, vector2 } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TKeyCode, TLabel, TUIEvent, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export interface INumPadWindowOwner {
  OnNumberReceive(text: string): void;
}

/**
 * todo;
 */
@LuabindClass()
export class NumPadWindow extends CUIScriptWnd {
  public owner: Optional<INumPadWindowOwner>;

  public uiEditBox!: CUIStatic;

  public constructor(owner: Optional<INumPadWindowOwner>) {
    super();

    logger.info("Initialize new numpad");

    this.owner = owner;

    this.initControls();
    this.initCallBacks();
  }

  public initControls(): void {
    this.SetWndPos(new vector2().set(342, 199));
    this.SetWndSize(new vector2().set(339, 369));

    const xml: XmlInit = new CScriptXmlInit();

    xml.ParseFile("ui_numpad_wnd.xml");
    xml.InitStatic("background", this);

    this.uiEditBox = xml.InitStatic("edit_box", this);
    this.uiEditBox.SetWindowName("edit_window");

    this.Register(xml.Init3tButton("btn_0", this), "btn_0");
    this.Register(xml.Init3tButton("btn_1", this), "btn_1");
    this.Register(xml.Init3tButton("btn_2", this), "btn_2");
    this.Register(xml.Init3tButton("btn_3", this), "btn_3");
    this.Register(xml.Init3tButton("btn_4", this), "btn_4");
    this.Register(xml.Init3tButton("btn_5", this), "btn_5");
    this.Register(xml.Init3tButton("btn_6", this), "btn_6");
    this.Register(xml.Init3tButton("btn_7", this), "btn_7");
    this.Register(xml.Init3tButton("btn_8", this), "btn_8");
    this.Register(xml.Init3tButton("btn_9", this), "btn_9");

    this.Register(xml.Init3tButton("btn_c", this), "btn_c");
    this.Register(xml.Init3tButton("btn_backspase", this), "btn_backspase");
    this.Register(xml.Init3tButton("btn_enter", this), "btn_enter");
    this.Register(xml.Init3tButton("btn_cancel", this), "btn_cancel");
  }

  public initCallBacks(): void {
    this.AddCallback("btn_enter", ui_events.BUTTON_CLICKED, () => this.onOkButtonClicked(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.onCancelButtonClicked(), this);

    this.AddCallback("btn_0", ui_events.BUTTON_CLICKED, () => this.addNumber(0), this);
    this.AddCallback("btn_1", ui_events.BUTTON_CLICKED, () => this.addNumber(1), this);
    this.AddCallback("btn_2", ui_events.BUTTON_CLICKED, () => this.addNumber(2), this);
    this.AddCallback("btn_3", ui_events.BUTTON_CLICKED, () => this.addNumber(3), this);
    this.AddCallback("btn_4", ui_events.BUTTON_CLICKED, () => this.addNumber(4), this);
    this.AddCallback("btn_5", ui_events.BUTTON_CLICKED, () => this.addNumber(5), this);
    this.AddCallback("btn_6", ui_events.BUTTON_CLICKED, () => this.addNumber(6), this);
    this.AddCallback("btn_7", ui_events.BUTTON_CLICKED, () => this.addNumber(7), this);
    this.AddCallback("btn_8", ui_events.BUTTON_CLICKED, () => this.addNumber(8), this);
    this.AddCallback("btn_9", ui_events.BUTTON_CLICKED, () => this.addNumber(9), this);

    this.AddCallback("btn_c", ui_events.BUTTON_CLICKED, () => this.onCButtonClicked(), this);
    this.AddCallback("btn_backspase", ui_events.BUTTON_CLICKED, () => this.onBackspaceButtonClicked(), this);
  }

  public addNumber(number: number): void {
    const text: TLabel = this.uiEditBox.TextControl().GetText() || "";

    if (string.len(text) > 12) {
      return;
    } else {
      this.uiEditBox.TextControl().SetText(text + number);
    }
  }

  public onBackspaceButtonClicked(): void {
    const text: TLabel = this.uiEditBox.TextControl().GetText();

    if (text === null) {
      return;
    }

    const b: number = 1;
    const e: number = string.len(text) - 1;

    this.uiEditBox.TextControl().SetText(string.sub(text, b, e));
  }

  public onCButtonClicked(): void {
    this.uiEditBox.TextControl().SetText("");
  }

  public onCancelButtonClicked(): void {
    logger.info("Cancel clicked");

    if (this.owner) {
      this.owner.OnNumberReceive("");
    }

    this.HideDialog();
  }

  public onOkButtonClicked(): void {
    logger.info("OK clicked");

    this.HideDialog();

    const text: TLabel = this.uiEditBox.TextControl().GetText();

    if (this.owner) {
      this.owner.OnNumberReceive(text);
    }
  }

  public override OnKeyboard(key: TKeyCode, event: TUIEvent): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.HideDialog();
      }

      if (key === DIK_keys.DIK_0 || key === DIK_keys.DIK_NUMPAD0) {
        this.addNumber(0);
      } else if (key === DIK_keys.DIK_1 || key === DIK_keys.DIK_NUMPAD1) {
        this.addNumber(1);
      } else if (key === DIK_keys.DIK_2 || key === DIK_keys.DIK_NUMPAD2) {
        this.addNumber(2);
      } else if (key === DIK_keys.DIK_3 || key === DIK_keys.DIK_NUMPAD3) {
        this.addNumber(3);
      } else if (key === DIK_keys.DIK_4 || key === DIK_keys.DIK_NUMPAD4) {
        this.addNumber(4);
      } else if (key === DIK_keys.DIK_5 || key === DIK_keys.DIK_NUMPAD5) {
        this.addNumber(5);
      } else if (key === DIK_keys.DIK_6 || key === DIK_keys.DIK_NUMPAD6) {
        this.addNumber(6);
      } else if (key === DIK_keys.DIK_7 || key === DIK_keys.DIK_NUMPAD7) {
        this.addNumber(7);
      } else if (key === DIK_keys.DIK_8 || key === DIK_keys.DIK_NUMPAD8) {
        this.addNumber(8);
      } else if (key === DIK_keys.DIK_9 || key === DIK_keys.DIK_NUMPAD9) {
        this.addNumber(9);
      } else if (key === DIK_keys.DIK_BACK) {
        this.onBackspaceButtonClicked();
      } else if (key === DIK_keys.DIK_RETURN || key === DIK_keys.DIK_NUMPADENTER) {
        this.onOkButtonClicked();
      } else if (key === DIK_keys.DIK_DELETE || key === DIK_keys.DIK_NUMPADCOMMA) {
        this.onCButtonClicked();
      }
    }

    return true;
  }
}
