import {
  CGameFont,
  CUIListBoxItem,
  CUIStatic,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  LuabindClass,
} from "xray16";

import { create2dVector } from "@/engine/core/utils/vector";
import { TSize } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemoPlayerStatItem extends CUIListBoxItem {
  public uiName: CUITextWnd;
  public uiFrags: CUITextWnd;
  public uiDeath: CUITextWnd;
  public uiArtefacts: CUITextWnd;
  public uiSpots: CUITextWnd;
  public uiRank: CUIStatic;

  public constructor(height: TSize, w1: TSize, w2: TSize) {
    super(height);

    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.uiName = this.GetTextItem();
    this.uiName.SetWndSize(create2dVector(w1, height));
    this.uiName.SetFont(GetFontLetterica16Russian());
    this.uiName.SetEllipsis(true);

    this.uiFrags = this.AddTextField("", w2);
    this.uiFrags.SetFont(GetFontLetterica16Russian());
    this.uiFrags.SetTextAlignment(CGameFont.alCenter);

    this.uiDeath = this.AddTextField("", w2);
    this.uiDeath.SetFont(GetFontLetterica16Russian());
    this.uiDeath.SetTextAlignment(CGameFont.alCenter);

    this.uiArtefacts = this.AddTextField("", w2);
    this.uiArtefacts.SetFont(GetFontLetterica16Russian());
    this.uiArtefacts.SetTextAlignment(CGameFont.alCenter);

    this.uiSpots = this.AddTextField("", w2);
    this.uiSpots.SetFont(GetFontLetterica16Russian());
    this.uiSpots.SetTextAlignment(CGameFont.alCenter);

    this.uiRank = this.AddIconField(w2);
    this.uiRank.SetStretchTexture(true);

    this.uiRank.SetWndSize(create2dVector(16, 16));

    // -- aligning rank icon to center
    this.uiRank.SetWndPos(create2dVector(this.uiRank.GetWndPos().x + (w2 - 16) / 2, 0));
  }
}
