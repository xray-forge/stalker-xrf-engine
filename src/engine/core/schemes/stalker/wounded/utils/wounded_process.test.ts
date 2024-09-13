import { describe, expect, it, jest } from "@jest/globals";

import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import {
  processFight,
  processHPWound,
  processPsyWound,
  processVictim,
} from "@/engine/core/schemes/stalker/wounded/utils/wounded_process";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { GameObject } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { MockGameObject } from "@/fixtures/xray";

describe("processHPWound util", () => {
  it("should correctly process null values with and without breakpoints", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processHPWound(object, MockLuaTable.mockFromArray([]), MockLuaTable.mockFromArray([]), 100)).toEqual([
      NIL,
      NIL,
    ]);
    expect(object.see).toHaveBeenCalledTimes(0);

    expect(processHPWound(object, parseWoundedData("100|example"), MockLuaTable.mockFromArray([]), 100)).toEqual([
      "example",
      NIL,
    ]);
    expect(object.see).toHaveBeenCalledTimes(1);

    expect(processHPWound(object, parseWoundedData("100|example@test"), MockLuaTable.mockFromArray([]), 100)).toEqual([
      "example",
      "test",
    ]);
    expect(object.see).toHaveBeenCalledTimes(2);
  });

  it("should correctly process values with see state", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(
      processHPWound(
        object,
        parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test11"),
        parseWoundedData("100|wounded_heavy_20@test2|50|wounded_heavy_21@test21"),
        75
      )
    ).toEqual(["wounded_heavy_20", "test2"]);
    expect(object.see).toHaveBeenCalledTimes(1);

    expect(
      processHPWound(
        object,
        parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test11"),
        parseWoundedData("100|wounded_heavy_20@test2|50|wounded_heavy_21@test21"),
        25
      )
    ).toEqual(["wounded_heavy_21", "test21"]);
    expect(object.see).toHaveBeenCalledTimes(2);
  });

  it("should correctly process values with not see state", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => false);

    expect(
      processHPWound(
        object,
        parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test11"),
        parseWoundedData("100|wounded_heavy_20@test2|50|wounded_heavy_21@test21"),
        75
      )
    ).toEqual(["wounded_heavy_10", "test1"]);
    expect(object.see).toHaveBeenCalledTimes(1);

    expect(
      processHPWound(
        object,
        parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test11"),
        parseWoundedData("100|wounded_heavy_20@test2|50|wounded_heavy_21@test21"),
        25
      )
    ).toEqual(["wounded_heavy_11", "test11"]);
    expect(object.see).toHaveBeenCalledTimes(2);
  });

  // todo: Decide / test / confirm.
  it("should fail on mismatching lists before it is fixed", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(() => {
      processHPWound(
        object,
        parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test11"),
        parseWoundedData("100|wounded_heavy_20@test2"),
        25
      );
    }).toThrow("Cannot read properties of null (reading 'state')");
  });
});

describe("processPsyWound util", () => {
  it("should correctly process null values with and without breakpoints", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processPsyWound(object, MockLuaTable.mockFromArray([]), 100)).toEqual([NIL, NIL]);
    expect(processPsyWound(object, parseWoundedData("100|example"), 100)).toEqual(["example", NIL]);
    expect(processPsyWound(object, parseWoundedData("100|example@test"), 100)).toEqual(["example", "test"]);
  });

  it("should correctly process multiple values", () => {
    const object: GameObject = MockGameObject.mock();

    expect(
      processPsyWound(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test2"), 75)
    ).toEqual(["wounded_heavy_10", "test1"]);
    expect(
      processPsyWound(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11@test2"), 25)
    ).toEqual(["wounded_heavy_11", "test2"]);
  });
});

describe("processVictim util", () => {
  it("should correctly process null values with and without breakpoints", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processVictim(object, MockLuaTable.mockFromArray([]), 100)).toBe(NIL);
    expect(processVictim(object, parseWoundedData("100|example"), 100)).toBe("example");
    expect(processVictim(object, parseWoundedData("100|example"), 100)).toBe("example");
  });

  it("should correctly process multiple values", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processVictim(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11"), 75)).toBe(
      "wounded_heavy_10"
    );
    expect(processVictim(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11"), 25)).toBe(
      "wounded_heavy_11"
    );
  });
});

describe("processFight util", () => {
  it("should correctly process null values with and without breakpoints", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processFight(object, MockLuaTable.mockFromArray([]), 100)).toBe(TRUE);
    expect(processFight(object, parseWoundedData("75|example"), 100)).toBe(TRUE);
    expect(processFight(object, parseWoundedData("75|example"), 50)).toBe("example");
  });

  it("should correctly process multiple values", () => {
    const object: GameObject = MockGameObject.mock();

    expect(processFight(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11"), 75)).toBe(
      "wounded_heavy_10"
    );
    expect(processFight(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11"), 25)).toBe(
      "wounded_heavy_11"
    );
    expect(processFight(object, parseWoundedData("100|wounded_heavy_10@test1|50|wounded_heavy_11"), 101)).toBe(TRUE);
  });
});
