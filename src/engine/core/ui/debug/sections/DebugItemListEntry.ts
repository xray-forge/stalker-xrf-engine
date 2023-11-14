import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

import { TSection } from "@/engine/lib/types";

/**
 * List item describing game item in items debugging section.
 */
@LuabindClass()
export class DebugItemListEntry extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerSectionText: CUITextWnd;

  public constructor(height: number, width: number, section: TSection) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);
    this.uiInnerSectionText = this.AddTextField(section, width);
    this.uiInnerSectionText.SetFont(GetFontLetterica16Russian());
  }
}
