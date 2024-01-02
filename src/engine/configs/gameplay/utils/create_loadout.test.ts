import { describe, expect, it } from "@jest/globals";

import { createLoadout } from "@/engine/configs/gameplay/utils/create_loadout";

describe("create_loadout util", () => {
  it("should correctly generate resulting strings", () => {
    expect(createLoadout([{ section: "test_sect" }])).toBe("test_sect \\n\r\n");
    expect(createLoadout([{ section: "test_sect", probability: 1 }])).toBe("test_sect \\n\r\n");
    expect(createLoadout([{ section: "test_sect", count: 4 }])).toBe("test_sect = 4 \\n\r\n");
    expect(createLoadout([{ section: "test_sect", probability: 0.25 }])).toBe("test_sect, prob = 0.25 \\n\r\n");
    expect(createLoadout([{ section: "test_sect", count: 4, probability: 0.5 }])).toBe(
      "test_sect = 4, prob = 0.5 \\n\r\n"
    );
    expect(createLoadout([{ section: "test_sect", count: 4, probability: 0.5, scope: true }])).toBe(
      "test_sect = 4, scope, prob = 0.5 \\n\r\n"
    );
    expect(createLoadout([{ section: "test_sect", count: 4, probability: 0.5, silencer: true }])).toBe(
      "test_sect = 4, silencer, prob = 0.5 \\n\r\n"
    );
    expect(createLoadout([{ section: "test_sect", count: 4, probability: 0.5, scope: true, silencer: true }])).toBe(
      "test_sect = 4, scope, silencer, prob = 0.5 \\n\r\n"
    );
    expect(
      createLoadout([
        { section: "test_sect", count: 4, probability: 0.5, scope: true },
        { section: "another_sect", count: 1, probability: 0.25, silencer: true },
      ])
    ).toBe("test_sect = 4, scope, prob = 0.5 \\n\r\nanother_sect, silencer, prob = 0.25 \\n\r\n");
  });

  it("should respect line endings", () => {
    expect(createLoadout([{ section: "test_sect" }])).toBe("test_sect \\n\r\n");
    expect(createLoadout([{ section: "test_sect" }], "\n")).toBe("test_sect \\n\n");
  });
});
