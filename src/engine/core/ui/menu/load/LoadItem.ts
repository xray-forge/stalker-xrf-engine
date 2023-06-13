import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

/**
 * todo;
 */
@LuabindClass()
export class LoadItem extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerAgeText: CUITextWnd;

  public constructor(height: number, dateWidth: number, dateTime: string) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);
    this.uiInnerAgeText = this.AddTextField(dateTime, dateWidth);
    this.uiInnerAgeText.SetFont(GetFontLetterica16Russian());
  }
}
