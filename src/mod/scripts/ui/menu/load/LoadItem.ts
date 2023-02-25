import { CUIListBoxItem, GetARGB, GetFontLetterica16Russian, GetFontLetterica18Russian, XR_CUITextWnd } from "xray16";

/**
 * todo;
 */
@LuabindClass()
export class LoadItem extends CUIListBoxItem {
  public innerNameText: XR_CUITextWnd;
  public innerAgeText: XR_CUITextWnd;

  public constructor(height: number, dateWidth: number, dateTime: string) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.innerNameText = this.GetTextItem();
    this.innerNameText.SetFont(GetFontLetterica18Russian());
    this.innerNameText.SetEllipsis(true);
    this.innerAgeText = this.AddTextField(dateTime, dateWidth);
    this.innerAgeText.SetFont(GetFontLetterica16Russian());
  }
}
