import { describe, expect, it } from "@jest/globals";
import { CUIStatic, CUITextWnd } from "xray16";

import { MultiplayerDemoPlayerStatItem } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoPlayerStatItem";

describe("MultiplayerDemoPlayerStatItem", () => {
  it("should correctly initialize", () => {
    const statItem: MultiplayerDemoPlayerStatItem = new MultiplayerDemoPlayerStatItem(1, 2, 3);

    expect(statItem.uiNameText).toBeInstanceOf(CUITextWnd);
    expect(statItem.uiFragsText).toBeInstanceOf(CUITextWnd);
    expect(statItem.uiDeathText).toBeInstanceOf(CUITextWnd);
    expect(statItem.uiArtefactsText).toBeInstanceOf(CUITextWnd);
    expect(statItem.uiSpotsText).toBeInstanceOf(CUITextWnd);
    expect(statItem.uiRankText).toBeInstanceOf(CUIStatic);

    expect(statItem.SetTextColor).toHaveBeenCalled();

    expect(statItem.uiNameText.SetWndSize).toHaveBeenCalled();
    expect(statItem.uiNameText.SetFont).toHaveBeenCalled();
    expect(statItem.uiNameText.SetEllipsis).toHaveBeenCalled();

    expect(statItem.uiFragsText.SetFont).toHaveBeenCalled();
    expect(statItem.uiFragsText.SetTextAlignment).toHaveBeenCalled();

    expect(statItem.uiDeathText.SetFont).toHaveBeenCalled();
    expect(statItem.uiDeathText.SetTextAlignment).toHaveBeenCalled();

    expect(statItem.uiArtefactsText.SetFont).toHaveBeenCalled();
    expect(statItem.uiArtefactsText.SetTextAlignment).toHaveBeenCalled();

    expect(statItem.uiSpotsText.SetFont).toHaveBeenCalled();
    expect(statItem.uiSpotsText.SetTextAlignment).toHaveBeenCalled();

    expect(statItem.uiRankText.SetStretchTexture).toHaveBeenCalled();
    expect(statItem.uiRankText.SetWndSize).toHaveBeenCalled();
    expect(statItem.uiRankText.SetWndPos).toHaveBeenCalled();
  });
});
