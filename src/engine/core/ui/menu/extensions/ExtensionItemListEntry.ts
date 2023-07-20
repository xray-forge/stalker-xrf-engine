import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

import { TIndex, TName } from "@/engine/lib/types";

/**
 * List entry of extensions options menu.
 * Describes extension name and load order.
 */
@LuabindClass()
export class ExtensionItemListEntry extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerSectionText: CUITextWnd;

  public constructor(height: number, width: number, index: TIndex, name: TName) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);
    this.uiInnerNameText.SetText(name);

    this.uiInnerSectionText = this.AddTextField(tostring(index), width);
    this.uiInnerSectionText.SetFont(GetFontLetterica16Russian());
  }
}
