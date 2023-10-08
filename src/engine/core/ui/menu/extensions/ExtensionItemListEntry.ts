import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { TIndex } from "@/engine/lib/types";

/**
 * List entry of extensions options menu.
 * Describes extension name and load order.
 */
@LuabindClass()
export class ExtensionItemListEntry extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerSectionText: CUITextWnd;

  public constructor(height: number, width: number, index: TIndex, descriptor: IExtensionsDescriptor) {
    super(height);

    this.SetTextColor(descriptor.isEnabled ? GetARGB(255, 170, 170, 170) : GetARGB(255, 255, 0, 0));

    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);
    this.uiInnerNameText.SetText(descriptor.name);

    this.uiInnerSectionText = this.AddTextField(tostring(index), width);
    this.uiInnerSectionText.SetFont(GetFontLetterica16Russian());
  }
}
