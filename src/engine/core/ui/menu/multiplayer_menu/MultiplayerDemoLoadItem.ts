import {
  CUI3tButton,
  CUIListBoxItemMsgChain,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  LuabindClass,
  ui_events,
} from "xray16";

import type { MultiplayerDemo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemo";
import { EElementType, initializeElement } from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { TName, TSize } from "@/engine/lib/types";

/**
 * Demo item from list in demo records.
 */
@LuabindClass()
export class MultiplayerDemoLoadItem extends CUIListBoxItemMsgChain {
  public filename: TName = "filename";

  public uiFileNameText: CUITextWnd;
  public uiFileAgeText: CUITextWnd;
  public uiDeleteButton: CUI3tButton;

  public constructor(owner: MultiplayerDemo, height: TSize, w1: TSize, w2: TSize) {
    super(height);

    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.uiFileNameText = this.GetTextItem();
    this.uiFileNameText.SetFont(GetFontLetterica16Russian());
    this.uiFileNameText.SetWndPos(create2dVector(20, 0));
    this.uiFileNameText.SetWndSize(create2dVector(w1, height));
    this.uiFileNameText.SetEllipsis(true);

    this.uiFileAgeText = this.AddTextField("", w2);
    this.uiFileAgeText.SetFont(GetFontLetterica16Russian());
    this.uiFileAgeText.SetWndSize(create2dVector(w2, height));

    this.uiDeleteButton = initializeElement(owner.xml, EElementType.BUTTON, "delete_demo_button", this, {
      context: owner.owner,
      [ui_events.BUTTON_CLICKED]: () => owner.onDeleteSelectedDemo(),
    });
  }
}
