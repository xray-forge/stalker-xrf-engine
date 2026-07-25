import { describe, expect, it } from "@jest/globals";
import { CUIListBoxItem } from "xray16";
import { Vector } from "xray16/alias";
import { MockVector } from "xray16/mocks";

import { DebugTeleportListEntry } from "@/engine/core/ui/debug/sections/DebugTeleportListEntry";

describe("DebugTeleportListEntry", () => {
  it("should correctly initialize with provided data", () => {
    const position: Vector = MockVector.create(1, 2, 3);
    const entry: DebugTeleportListEntry = new DebugTeleportListEntry(24, 120, "label", "caption", position, 500, 600);

    expect(entry).toBeInstanceOf(CUIListBoxItem);
    expect(entry.position).toBe(position);
    expect(entry.lvid).toBe(500);
    expect(entry.gvid).toBe(600);

    expect(entry.SetTextColor).toHaveBeenCalledTimes(1);

    expect(entry.uiInnerNameText).toBe(entry.GetTextItem());
    expect(entry.uiInnerNameText.SetEllipsis).toHaveBeenCalledWith(true);
    expect(entry.uiInnerNameText.SetText).toHaveBeenCalledWith("caption");
    expect(entry.uiInnerNameText.SetFont).toHaveBeenCalledTimes(1);

    expect(entry.AddTextField).toHaveBeenCalledWith("label", 120);
    expect(entry.uiInnerSectionText.SetFont).toHaveBeenCalledTimes(1);
  });
});
