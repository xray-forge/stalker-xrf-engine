import {
  CGameFont,
  CUIListBoxItem,
  CUIStatic,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  LuabindClass,
  vector2,
} from "xray16";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemoPlayerStatItem extends CUIListBoxItem {
  public name: CUITextWnd;
  public frags: CUITextWnd;
  public death: CUITextWnd;
  public artefacts: CUITextWnd;
  public spots: CUITextWnd;
  public rank: CUIStatic;

  public constructor(height: number, w1: number, w2: number) {
    super(height);

    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.name = this.GetTextItem();
    this.name.SetWndSize(new vector2().set(w1, height));
    this.name.SetFont(GetFontLetterica16Russian());
    this.name.SetEllipsis(true);

    this.frags = this.AddTextField("", w2);
    this.frags.SetFont(GetFontLetterica16Russian());
    this.frags.SetTextAlignment(CGameFont.alCenter);

    this.death = this.AddTextField("", w2);
    this.death.SetFont(GetFontLetterica16Russian());
    this.death.SetTextAlignment(CGameFont.alCenter);

    this.artefacts = this.AddTextField("", w2);
    this.artefacts.SetFont(GetFontLetterica16Russian());
    this.artefacts.SetTextAlignment(CGameFont.alCenter);

    this.spots = this.AddTextField("", w2);
    this.spots.SetFont(GetFontLetterica16Russian());
    this.spots.SetTextAlignment(CGameFont.alCenter);

    this.rank = this.AddIconField(w2);
    this.rank.SetStretchTexture(true);

    this.rank.SetWndSize(new vector2().set(16, 16));

    // -- aligning rank icon to center
    this.rank.SetWndPos(new vector2().set(this.rank.GetWndPos().x + (w2 - 16) / 2, 0));
  }
}
