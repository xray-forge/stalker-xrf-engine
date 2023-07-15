import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

import { TLabel, TSize } from "@/engine/lib/types";

/**
 * Save dialog list item entry.
 */
@LuabindClass()
export class SaveItem extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerAgeText: CUITextWnd;

  public constructor(height: TSize, ageFieldWidth: TSize, dataTime: TLabel) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));
    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);

    this.uiInnerAgeText = this.AddTextField(dataTime, ageFieldWidth);
    this.uiInnerAgeText.SetFont(GetFontLetterica16Russian());
  }
}
