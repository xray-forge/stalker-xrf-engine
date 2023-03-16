import {
  CUIListBoxItemMsgChain,
  GetARGB,
  GetFontLetterica16Russian,
  LuabindClass,
  ui_events,
  vector2,
  XR_CUI3tButton,
  XR_CUITextWnd,
} from "xray16";

import { MultiplayerDemo } from "@/mod/scripts/core/ui/menu/multiplayer/MultiplayerDemo";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemoLoadItem extends CUIListBoxItemMsgChain {
  public filename: string;

  public fn: XR_CUITextWnd;
  public fage: XR_CUITextWnd;
  public delete_button: XR_CUI3tButton;

  public constructor(owner: MultiplayerDemo, height: number, w1: number, w2: number) {
    super(height);

    const handler = owner.owner;

    this.filename = "filename";
    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.fn = this.GetTextItem();
    this.fn.SetFont(GetFontLetterica16Russian());
    this.fn.SetWndPos(new vector2().set(20, 0));
    this.fn.SetWndSize(new vector2().set(w1, height));
    this.fn.SetEllipsis(true);

    this.fage = this.AddTextField("", w2);
    this.fage.SetFont(GetFontLetterica16Russian());
    this.fage.SetWndSize(new vector2().set(w2, height));

    // --this.AttachChild                        (del_btn)
    this.delete_button = owner.xml.Init3tButton("delete_demo_button", this);

    handler.Register(this.delete_button, "delete_demo_button");
    handler.AddCallback("delete_demo_button", ui_events.BUTTON_CLICKED, () => owner.deleteSelectedDemo(), owner);
  }
}
