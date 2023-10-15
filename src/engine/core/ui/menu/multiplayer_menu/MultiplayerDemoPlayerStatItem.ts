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
 * Player stat item for demo record.
 */
@LuabindClass()
export class MultiplayerDemoPlayerStatItem extends CUIListBoxItem {
  public uiNameText: CUITextWnd;
  public uiFragsText: CUITextWnd;
  public uiDeathText: CUITextWnd;
  public uiArtefactsText: CUITextWnd;
  public uiSpotsText: CUITextWnd;
  public uiRankText: CUIStatic;

  public constructor(height: TSize, w1: TSize, w2: TSize) {
    super(height);

    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.uiNameText = this.GetTextItem();
    this.uiNameText.SetWndSize(create2dVector(w1, height));
    this.uiNameText.SetFont(GetFontLetterica16Russian());
    this.uiNameText.SetEllipsis(true);

    this.uiFragsText = this.AddTextField("", w2);
    this.uiFragsText.SetFont(GetFontLetterica16Russian());
    this.uiFragsText.SetTextAlignment(CGameFont.alCenter);

    this.uiDeathText = this.AddTextField("", w2);
    this.uiDeathText.SetFont(GetFontLetterica16Russian());
    this.uiDeathText.SetTextAlignment(CGameFont.alCenter);

    this.uiArtefactsText = this.AddTextField("", w2);
    this.uiArtefactsText.SetFont(GetFontLetterica16Russian());
    this.uiArtefactsText.SetTextAlignment(CGameFont.alCenter);

    this.uiSpotsText = this.AddTextField("", w2);
    this.uiSpotsText.SetFont(GetFontLetterica16Russian());
    this.uiSpotsText.SetTextAlignment(CGameFont.alCenter);

    this.uiRankText = this.AddIconField(w2);
    this.uiRankText.SetStretchTexture(true);
    this.uiRankText.SetWndSize(create2dVector(16, 16));
    this.uiRankText.SetWndPos(create2dVector(this.uiRankText.GetWndPos().x + (w2 - 16) / 2, 0));
  }
}
