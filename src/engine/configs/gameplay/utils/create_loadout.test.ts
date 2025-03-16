import { describe, expect, it } from "@jest/globals";

import {
  createSpawnList,
  createSpawnLoadout,
  createSpawnLoadoutFlag,
} from "@/engine/configs/gameplay/utils/create_loadout";

describe("createSpawnList util", () => {
  it("should correctly generate resulting strings", () => {
    expect(createSpawnList([{ section: "test_sect" }])).toBe("test_sect=1 \\n\n");
    expect(createSpawnList([{ section: "test_sect", probability: 1 }])).toBe("test_sect=1 \\n\n");
    expect(createSpawnList([{ section: "test_sect", count: 4 }])).toBe("test_sect=4 \\n\n");
    expect(createSpawnList([{ section: "test_sect", probability: 0.25 }])).toBe("test_sect=1, prob=0.25 \\n\n");
    expect(createSpawnList([{ section: "test_sect", cond: 0.25 }])).toBe("test_sect=1, cond=0.25 \\n\n");
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5 }])).toBe("test_sect=4, prob=0.5 \\n\n");
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5, cond: 0.45 }])).toBe(
      "test_sect=4, prob=0.5, cond=0.45 \\n\n"
    );
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5, scope: true }])).toBe(
      "test_sect=4, scope, prob=0.5 \\n\n"
    );
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5, launcher: true }])).toBe(
      "test_sect=4, launcher, prob=0.5 \\n\n"
    );
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5, silencer: true }])).toBe(
      "test_sect=4, silencer, prob=0.5 \\n\n"
    );
    expect(createSpawnList([{ section: "test_sect", count: 4, probability: 0.5, scope: true, silencer: true }])).toBe(
      "test_sect=4, scope, silencer, prob=0.5 \\n\n"
    );
    expect(
      createSpawnList([
        { section: "test_sect", count: 4, probability: 0.5, scope: true, silencer: true, launcher: true },
      ])
    ).toBe("test_sect=4, scope, silencer, launcher, prob=0.5 \\n\n");
    expect(
      createSpawnList([
        { section: "test_sect", count: 4, probability: 0.5, scope: true },
        { section: "another_sect", count: 1, probability: 0.25, silencer: true },
      ])
    ).toBe("test_sect=4, scope, prob=0.5 \\n\nanother_sect=1, silencer, prob=0.25 \\n\n");
    expect(
      createSpawnList([
        { section: "test_sect", count: 4, scope: 0.2, launcher: 1, silencer: true },
        { section: "another_sect", count: 1, silencer: true },
      ])
    ).toBe("test_sect=4, scope=0.2, silencer, launcher \\n\n" + "another_sect=1, silencer \\n\n");
  });

  it("should respect line endings", () => {
    expect(createSpawnList([{ section: "test_sect" }], "\r\n")).toBe("test_sect=1 \\n\r\n");
    expect(createSpawnList([{ section: "test_sect" }], "\n")).toBe("test_sect=1 \\n\n");
    expect(createSpawnList([{ section: "test_sect" }])).toBe("test_sect=1 \\n\n");
  });
});

describe("createSpawnLoadout util", () => {
  it("should correctly generate resulting strings", () => {
    expect(createSpawnLoadout([{ section: "test_sect" }])).toBe("test_sect=1 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect" }])).toBe("test_sect=1 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect", count: 4 }])).toBe("test_sect=4 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect", cond: 0.4 }])).toBe("test_sect=1, cond=0.4 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect", ammoType: 1 }])).toBe("test_sect=1, ammo_type=1 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect", level: "zaton" }])).toBe("test_sect=1, level=zaton \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect", count: 4, scope: true, cond: 0.99 }])).toBe(
      "test_sect=4, scope, cond=0.99 \\n\n"
    );
    expect(createSpawnLoadout([{ section: "test_sect", count: 4, launcher: true }])).toBe(
      "test_sect=4, launcher \\n\n"
    );
    expect(createSpawnLoadout([{ section: "test_sect", count: 4, silencer: true }])).toBe(
      "test_sect=4, silencer \\n\n"
    );
    expect(createSpawnLoadout([{ section: "test_sect", count: 4, scope: true, silencer: true }])).toBe(
      "test_sect=4, scope, silencer \\n\n"
    );
    expect(createSpawnLoadout([{ section: "test_sect", count: 4, scope: true, silencer: true, launcher: true }])).toBe(
      "test_sect=4, scope, silencer, launcher \\n\n"
    );
    expect(
      createSpawnLoadout([
        { section: "test_sect", count: 4, scope: true },
        { section: "another_sect", count: 1, silencer: true, ammoType: 2 },
      ])
    ).toBe("test_sect=4, scope \\n\nanother_sect=1, silencer, ammo_type=2 \\n\n");
    expect(
      createSpawnLoadout([
        { section: "test_sect", count: 4, scope: 0.2, launcher: 1, silencer: true },
        { section: "another_sect", count: 1, silencer: true, ammoType: 2 },
      ])
    ).toBe("test_sect=4, scope=0.2, silencer, launcher \\n\n" + "another_sect=1, silencer, ammo_type=2 \\n\n");
  });

  it("should respect line endings", () => {
    expect(createSpawnLoadout([{ section: "test_sect" }], "\r\n")).toBe("test_sect=1 \\n\r\n");
    expect(createSpawnLoadout([{ section: "test_sect" }], "\n")).toBe("test_sect=1 \\n\n");
    expect(createSpawnLoadout([{ section: "test_sect" }])).toBe("test_sect=1 \\n\n");
  });
});

describe("createSpawnLoadoutFlag util", () => {
  it("should correctly serialize values", () => {
    expect(createSpawnLoadoutFlag("test", false)).toBe("");
    expect(createSpawnLoadoutFlag("test", undefined)).toBe("");
    expect(createSpawnLoadoutFlag("test", 0)).toBe("");
    expect(createSpawnLoadoutFlag("test", true)).toBe(", test");
    expect(createSpawnLoadoutFlag("test", 1)).toBe(", test");
    expect(createSpawnLoadoutFlag("test", 0.5)).toBe(", test=0.5");
    expect(createSpawnLoadoutFlag("test", 0.25)).toBe(", test=0.25");
    expect(createSpawnLoadoutFlag("test", 0.75)).toBe(", test=0.75");
    expect(createSpawnLoadoutFlag("test", 0.99)).toBe(", test=0.99");
  });

  it("should correctly throw exception on validation error", () => {
    expect(() => createSpawnLoadoutFlag("test", -100)).toThrow(
      "Invalid range for scope probability value: 'test' set to -100."
    );
    expect(() => createSpawnLoadoutFlag("test", -1)).toThrow(
      "Invalid range for scope probability value: 'test' set to -1."
    );
    expect(() => createSpawnLoadoutFlag("test", 1.1)).toThrow(
      "Invalid range for scope probability value: 'test' set to 1.1."
    );
    expect(() => createSpawnLoadoutFlag("test", 100)).toThrow(
      "Invalid range for scope probability value: 'test' set to 100."
    );
  });
});
