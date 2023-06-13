import {
  CUIListBoxItem,
  CUITextWnd,
  GetARGB,
  GetFontLetterica16Russian,
  GetFontLetterica18Russian,
  LuabindClass,
} from "xray16";

import { TLabel, TNumberId, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class DebugTeleportListEntry extends CUIListBoxItem {
  public uiInnerNameText: CUITextWnd;
  public uiInnerSectionText: CUITextWnd;

  public position: Vector;
  public lvid: TNumberId;
  public gvid: TNumberId;

  public constructor(
    height: number,
    width: number,
    label: TLabel,
    caption: TLabel,
    position: Vector,
    lvid: TNumberId,
    gvid: TNumberId
  ) {
    super(height);

    this.SetTextColor(GetARGB(255, 170, 170, 170));

    this.uiInnerNameText = this.GetTextItem();
    this.uiInnerNameText.SetFont(GetFontLetterica18Russian());
    this.uiInnerNameText.SetEllipsis(true);
    this.uiInnerNameText.SetText(caption);

    this.uiInnerSectionText = this.AddTextField(label, width);
    this.uiInnerSectionText.SetFont(GetFontLetterica16Russian());

    this.gvid = gvid;
    this.lvid = lvid;
    this.position = position;
  }
}
