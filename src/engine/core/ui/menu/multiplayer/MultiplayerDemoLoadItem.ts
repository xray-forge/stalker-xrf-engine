import {
  CUI3tButton,
  CUIListBoxItemMsgChain,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  LuabindClass,
  ui_events,
  vector2,
} from "xray16";

import type { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemo";
import type { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import type { TName } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemoLoadItem extends CUIListBoxItemMsgChain {
  public filename: TName;

  public uiFn: CUITextWnd;
  public uiFage: CUITextWnd;
  public uiDeleteButton: CUI3tButton;

  public constructor(owner: MultiplayerDemo, height: number, w1: number, w2: number) {
    super(height);

    const handler: MultiplayerMenu = owner.owner;

    this.filename = "filename";
    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.uiFn = this.GetTextItem();
    this.uiFn.SetFont(GetFontLetterica16Russian());
    this.uiFn.SetWndPos(new vector2().set(20, 0));
    this.uiFn.SetWndSize(new vector2().set(w1, height));
    this.uiFn.SetEllipsis(true);

    this.uiFage = this.AddTextField("", w2);
    this.uiFage.SetFont(GetFontLetterica16Russian());
    this.uiFage.SetWndSize(new vector2().set(w2, height));

    // --this.AttachChild                        (del_btn)
    this.uiDeleteButton = owner.xml.Init3tButton("delete_demo_button", this);

    handler.Register(this.uiDeleteButton, "delete_demo_button");
    handler.AddCallback("delete_demo_button", ui_events.BUTTON_CLICKED, () => owner.deleteSelectedDemo(), owner);
  }
}
