import {
  CScriptXmlInit,
  CUIScriptWnd,
  CUIStatic,
  DIK_keys,
  LuabindClass,
  TXR_DIK_key,
  TXR_ui_event,
  ui_events,
  vector2,
} from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

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

  public editBox!: CUIStatic;

  public constructor(owner: Optional<INumPadWindowOwner>) {
    super();

    logger.info("Initialize new numpad");

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
  }

  public InitControls(): void {
    this.SetWndPos(new vector2().set(342, 199));
    this.SetWndSize(new vector2().set(339, 369));

    const xml = new CScriptXmlInit();

    xml.ParseFile("ui_numpad_wnd.xml");
    xml.InitStatic("background", this);

    this.editBox = xml.InitStatic("edit_box", this);
    this.editBox.SetWindowName("edit_window");

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

  public InitCallBacks(): void {
    this.AddCallback("btn_enter", ui_events.BUTTON_CLICKED, () => this.OnButton_OK_clicked(), this);
    this.AddCallback("btn_cancel", ui_events.BUTTON_CLICKED, () => this.OnButton_CANCEL_clicked(), this);

    this.AddCallback("btn_0", ui_events.BUTTON_CLICKED, () => this.AddNumber(0), this);
    this.AddCallback("btn_1", ui_events.BUTTON_CLICKED, () => this.AddNumber(1), this);
    this.AddCallback("btn_2", ui_events.BUTTON_CLICKED, () => this.AddNumber(2), this);
    this.AddCallback("btn_3", ui_events.BUTTON_CLICKED, () => this.AddNumber(3), this);
    this.AddCallback("btn_4", ui_events.BUTTON_CLICKED, () => this.AddNumber(4), this);
    this.AddCallback("btn_5", ui_events.BUTTON_CLICKED, () => this.AddNumber(5), this);
    this.AddCallback("btn_6", ui_events.BUTTON_CLICKED, () => this.AddNumber(6), this);
    this.AddCallback("btn_7", ui_events.BUTTON_CLICKED, () => this.AddNumber(7), this);
    this.AddCallback("btn_8", ui_events.BUTTON_CLICKED, () => this.AddNumber(8), this);
    this.AddCallback("btn_9", ui_events.BUTTON_CLICKED, () => this.AddNumber(9), this);

    this.AddCallback("btn_c", ui_events.BUTTON_CLICKED, () => this.OnButton_c_clicked(), this);
    this.AddCallback("btn_backspase", ui_events.BUTTON_CLICKED, () => this.OnButton_backspace_clicked(), this);
  }

  public AddNumber(number: number): void {
    const text = this.editBox.TextControl().GetText() || "";

    if (string.len(text) > 12) {
      return;
    } else {
      this.editBox.TextControl().SetText(text + number);
    }
  }

  public OnButton_backspace_clicked(): void {
    const text = this.editBox.TextControl().GetText();

    if (text === null) {
      return;
    }

    const b = 1;
    const e = string.len(text) - 1;

    this.editBox.TextControl().SetText(string.sub(text, b, e));
  }

  public OnButton_c_clicked(): void {
    this.editBox.TextControl().SetText("");
  }

  public OnButton_CANCEL_clicked(): void {
    logger.info("Cancel clicked");

    if (this.owner) {
      this.owner.OnNumberReceive("");
    }

    this.HideDialog();
  }

  public OnButton_OK_clicked(): void {
    logger.info("OK clicked");

    this.HideDialog();

    const text = this.editBox.TextControl().GetText();

    if (this.owner) {
      this.owner.OnNumberReceive(text);
    }
  }

  public override OnKeyboard(key: TXR_DIK_key, event: TXR_ui_event): boolean {
    super.OnKeyboard(key, event);

    if (event === ui_events.WINDOW_KEY_PRESSED) {
      if (key === DIK_keys.DIK_ESCAPE) {
        this.HideDialog();
      }

      if (key === DIK_keys.DIK_0 || key === DIK_keys.DIK_NUMPAD0) {
        this.AddNumber(0);
      } else if (key === DIK_keys.DIK_1 || key === DIK_keys.DIK_NUMPAD1) {
        this.AddNumber(1);
      } else if (key === DIK_keys.DIK_2 || key === DIK_keys.DIK_NUMPAD2) {
        this.AddNumber(2);
      } else if (key === DIK_keys.DIK_3 || key === DIK_keys.DIK_NUMPAD3) {
        this.AddNumber(3);
      } else if (key === DIK_keys.DIK_4 || key === DIK_keys.DIK_NUMPAD4) {
        this.AddNumber(4);
      } else if (key === DIK_keys.DIK_5 || key === DIK_keys.DIK_NUMPAD5) {
        this.AddNumber(5);
      } else if (key === DIK_keys.DIK_6 || key === DIK_keys.DIK_NUMPAD6) {
        this.AddNumber(6);
      } else if (key === DIK_keys.DIK_7 || key === DIK_keys.DIK_NUMPAD7) {
        this.AddNumber(7);
      } else if (key === DIK_keys.DIK_8 || key === DIK_keys.DIK_NUMPAD8) {
        this.AddNumber(8);
      } else if (key === DIK_keys.DIK_9 || key === DIK_keys.DIK_NUMPAD9) {
        this.AddNumber(9);
      } else if (key === DIK_keys.DIK_BACK) {
        this.OnButton_backspace_clicked();
      } else if (key === DIK_keys.DIK_RETURN || key === DIK_keys.DIK_NUMPADENTER) {
        this.OnButton_OK_clicked();
      } else if (key === DIK_keys.DIK_DELETE || key === DIK_keys.DIK_NUMPADCOMMA) {
        this.OnButton_c_clicked();
      }
    }

    return true;
  }
}
