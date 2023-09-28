import { describe, expect, it } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { DebugTaskSection } from "@/engine/core/ui/debug/sections/DebugTaskSection";

describe("DebugTaskSection window", () => {
  it("should correctly initialize", () => {
    const owner: CUIScriptWnd = new CUIScriptWnd();
    const section: DebugTaskSection = new DebugTaskSection(owner, "test");

    expect(section.owner).toBe(owner);
    expect(section.filterIsActive).toBe(false);
  });
});
