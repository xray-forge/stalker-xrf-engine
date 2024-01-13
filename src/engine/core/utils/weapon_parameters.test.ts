import { describe, expect, it } from "@jest/globals";

import {
  normalizeWeaponParameter,
  normalizeWeaponParameterInMultiplayer,
  readWeaponAccuracy,
  readWeaponDamage,
  readWeaponDamageMultiplayer,
  readWeaponHandling,
  readWeaponParameter,
  readWeaponRPM,
} from "@/engine/core/utils/weapon_parameters";
import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("normalizeWeaponParameterInMultiplayer util", () => {
  it("should correctly clamp values", () => {
    expect(normalizeWeaponParameterInMultiplayer(-500)).toBe(1);
    expect(normalizeWeaponParameterInMultiplayer(-50)).toBe(1);
    expect(normalizeWeaponParameterInMultiplayer(0)).toBe(1);
    expect(normalizeWeaponParameterInMultiplayer(1)).toBe(1);
    expect(normalizeWeaponParameterInMultiplayer(10)).toBe(10);
    expect(normalizeWeaponParameterInMultiplayer(50)).toBe(50);
    expect(normalizeWeaponParameterInMultiplayer(75)).toBe(75);
    expect(normalizeWeaponParameterInMultiplayer(100)).toBe(100);
    expect(normalizeWeaponParameterInMultiplayer(101)).toBe(100);
    expect(normalizeWeaponParameterInMultiplayer(500)).toBe(100);
  });
});

describe("normalizeWeaponParameter util", () => {
  it("should correctly normalize values with sample limit", () => {
    expect(normalizeWeaponParameter(-500, 30, 90)).toBe(0);
    expect(normalizeWeaponParameter(-50, 30, 90)).toBe(0);
    expect(normalizeWeaponParameter(1, 30, 90)).toBe(0);
    expect(normalizeWeaponParameter(50, 30, 90)).toBeCloseTo(33.33);
    expect(normalizeWeaponParameter(100, 30, 90)).toBeCloseTo(116.666);
    expect(normalizeWeaponParameter(101, 30, 90)).toBeCloseTo(118.33);
    expect(normalizeWeaponParameter(500, 30, 90)).toBeCloseTo(783.33);
  });

  it("should correctly normalize values with another sample limit", () => {
    expect(normalizeWeaponParameter(-50, 15, 120)).toBe(0);
    expect(normalizeWeaponParameter(1, 15, 120)).toBe(0);
    expect(normalizeWeaponParameter(50, 15, 120)).toBeCloseTo(33.33);
    expect(normalizeWeaponParameter(100, 15, 120)).toBeCloseTo(80.95);
    expect(normalizeWeaponParameter(101, 15, 120)).toBeCloseTo(81.9);
    expect(normalizeWeaponParameter(500, 15, 120)).toBeCloseTo(461.9);
  });
});

describe("readWeaponParameter util", () => {
  it("should correctly read values without section", () => {
    expect(() => readWeaponParameter(MockIniFile.mock("test.ltx"), "example_section", null, "not_existing")).toThrow(
      "Unexpected ini file read operation, field 'not_existing' in section 'example_section' does not exist."
    );
  });

  it("should correctly read values without upgrades", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      example_section: {
        hit_power: 400,
      },
    });

    expect(readWeaponParameter(ini, "example_section", null, "hit_power")).toBe(400);
    expect(readWeaponParameter(ini, "example_section", "", "hit_power")).toBe(400);
  });

  it("should correctly read hit_power values with upgrades", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      example_section: {
        hit_power: 400,
      },
      first: {
        hit_power: 300,
      },
      second: {
        hit_power: 600,
      },
      third: {},
    });

    expect(readWeaponParameter(ini, "example_section", "first, second, third, fourth", "hit_power")).toBe(600);
  });

  it("should correctly read values with upgrades", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      example_section: {
        rpm: 100,
      },
      first: {
        rpm: 300,
      },
      second: {
        rpm: 600,
      },
      third: {},
    });

    expect(readWeaponParameter(ini, "example_section", "first, second, third, fourth", "rpm")).toBe(1000);
  });
});

describe("readWeaponRPM util", () => {
  it("should correctly read values without upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_rpm_1: {
        rpm: -1000,
      },
      test_rpm_2: {
        rpm: 0,
      },
      test_rpm_3: {
        rpm: 500,
      },
      test_rpm_4: {
        rpm: 800,
      },
      test_rpm_5: {
        rpm: 2100,
      },
    });

    expect(readWeaponRPM("test_rpm_1")).toBe(0);
    expect(readWeaponRPM("test_rpm_2")).toBe(0);
    expect(readWeaponRPM("test_rpm_3")).toBeCloseTo(43.478);
    expect(readWeaponRPM("test_rpm_4")).toBeCloseTo(69.565);
    expect(readWeaponRPM("test_rpm_5")).toBeCloseTo(182.608);
  });

  it("should correctly read values with upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_rpm_a: {
        rpm: 500,
      },
      test_rpm_b: {
        rpm: 800,
      },
      a: {
        rpm: 50,
      },
      b: {
        rpm: 85,
      },
      c: {
        rpm: 125,
      },
      d: {
        rpm: 140,
      },
    });

    expect(readWeaponRPM("test_rpm_a", "a, b")).toBeCloseTo(55.217);
    expect(readWeaponRPM("test_rpm_b", "c, d")).toBeCloseTo(92.608);
  });
});

describe("readWeaponHandling util", () => {
  it("should correctly read values without upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_handling_1: {
        crosshair_inertion: 0,
      },
      test_handling_2: {},
      test_handling_3: {
        crosshair_inertion: 1,
      },
      test_handling_4: {
        crosshair_inertion: 10,
      },
      test_handling_5: {
        crosshair_inertion: 11.9,
      },
      test_handling_6: {
        crosshair_inertion: 20,
      },
    });

    expect(readWeaponHandling("test_handling_1")).toBeCloseTo(113.333);
    expect(readWeaponHandling("test_handling_2")).toBeCloseTo(103.809);
    expect(readWeaponHandling("test_handling_3")).toBeCloseTo(103.809);
    expect(readWeaponHandling("test_handling_4")).toBeCloseTo(18.095);
    expect(readWeaponHandling("test_handling_5")).toBe(0);
    expect(readWeaponHandling("test_handling_6")).toBe(0);
  });

  it("should correctly read values with upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_handling_a: {
        crosshair_inertion: 1,
      },
      test_handling_b: {
        crosshair_inertion: 0.5,
      },
      a: {
        crosshair_inertion: 1.5,
      },
      b: {
        crosshair_inertion: 2.5,
      },
      c: {
        crosshair_inertion: -0.5,
      },
      d: {
        crosshair_inertion: -1,
      },
    });

    expect(readWeaponHandling("test_handling_a", "a, b")).toBeCloseTo(65.714);
    expect(readWeaponHandling("test_handling_b", "c, d")).toBeCloseTo(122.857);
  });
});

describe("readWeaponAccuracy util", () => {
  it("should correctly read values without upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_dispersion_1: {
        fire_dispersion_base: 1,
      },
      test_dispersion_2: {
        fire_dispersion_base: 0.08,
      },
      test_dispersion_3: {
        fire_dispersion_base: 0.06,
      },
      test_dispersion_4: {
        fire_dispersion_base: 0.04,
      },
      test_dispersion_5: {
        fire_dispersion_base: 0.0375,
      },
      test_dispersion_6: {
        fire_dispersion_base: 0,
      },
    });

    expect(readWeaponAccuracy("test_dispersion_1")).toBe(0);
    expect(readWeaponAccuracy("test_dispersion_2")).toBeCloseTo(92.94);
    expect(readWeaponAccuracy("test_dispersion_3")).toBeCloseTo(97.647);
    expect(readWeaponAccuracy("test_dispersion_4")).toBeCloseTo(102.352);
    expect(readWeaponAccuracy("test_dispersion_5")).toBeCloseTo(102.941);
    expect(readWeaponAccuracy("test_dispersion_6")).toBeCloseTo(111.764);
  });

  it("should correctly read values with upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_dispersion_a: {
        fire_dispersion_base: 0.05,
      },
      test_dispersion_b: {
        fire_dispersion_base: 0.01,
      },
      a: {
        fire_dispersion_base: 0.01,
      },
      b: {
        fire_dispersion_base: 0.02,
      },
      c: {
        fire_dispersion_base: 0.03,
      },
      d: {
        fire_dispersion_base: 0.025,
      },
    });

    expect(readWeaponAccuracy("test_dispersion_a", "a, b")).toBeCloseTo(92.94);
    expect(readWeaponAccuracy("test_dispersion_b", "c, d")).toBeCloseTo(96.47);
  });
});

describe("readWeaponDamage util", () => {
  it("should correctly read values without upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_power_1: {
        hit_power: -1,
      },
      test_power_2: {
        hit_power: 0,
      },
      test_power_3: {
        hit_power: 0.3,
      },
      test_power_4: {
        hit_power: 0.6,
      },
      test_power_5: {
        hit_power: 0.9,
      },
      test_power_6: {
        hit_power: 1.5,
      },
    });

    expect(readWeaponDamage("test_power_1")).toBe(0);
    expect(readWeaponDamage("test_power_2")).toBe(0);
    expect(readWeaponDamage("test_power_3")).toBeCloseTo(33.333);
    expect(readWeaponDamage("test_power_4")).toBeCloseTo(66.666);
    expect(readWeaponDamage("test_power_5")).toBeCloseTo(100);
    expect(readWeaponDamage("test_power_6")).toBeCloseTo(166.666);
  });

  it("should correctly read values with upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_power_a: {
        hit_power: 0.3,
      },
      test_power_b: {
        hit_power: 0.6,
      },
      a: {
        hit_power: 0.4,
      },
      b: {
        hit_power: 0.5,
      },
      c: {
        hit_power: 0.7,
      },
      d: {
        hit_power: 0.8,
      },
    });

    expect(readWeaponDamage("test_power_a", "a, b")).toBeCloseTo(55.555);
    expect(readWeaponDamage("test_power_b", "c, d")).toBeCloseTo(88.888);
  });
});

describe("readWeaponDamageMultiplayer util", () => {
  it("should correctly read values without upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_power_1: {
        hit_power: -1,
      },
      test_power_2: {
        hit_power: 0,
      },
      test_power_3: {
        hit_power: 0.1,
      },
      test_power_4: {
        hit_power: 0.5,
      },
      test_power_5: {
        hit_power: 1,
      },
      test_power_6: {
        hit_power: 1.5,
      },
    });

    expect(readWeaponDamageMultiplayer("test_power_1")).toBe(1);
    expect(readWeaponDamageMultiplayer("test_power_2")).toBe(1);
    expect(readWeaponDamageMultiplayer("test_power_3")).toBe(10);
    expect(readWeaponDamageMultiplayer("test_power_4")).toBe(50);
    expect(readWeaponDamageMultiplayer("test_power_5")).toBe(100);
    expect(readWeaponDamageMultiplayer("test_power_6")).toBe(100);
  });

  it("should correctly read values with upgrades", () => {
    const ini: MockIniFile = MockIniFile.create("system.ini");

    Object.assign(ini.data, {
      test_power_a: {
        hit_power: 0.1,
      },
      test_power_b: {
        hit_power: 0.5,
      },
      a: {
        hit_power: 0.6,
      },
      b: {
        hit_power: 0.7,
      },
      c: {
        hit_power: 0.8,
      },
      d: {
        hit_power: 0.9,
      },
    });

    expect(readWeaponDamageMultiplayer("test_power_a", "a, b")).toBe(70);
    expect(readWeaponDamageMultiplayer("test_power_b", "c, d")).toBe(90);
  });
});
