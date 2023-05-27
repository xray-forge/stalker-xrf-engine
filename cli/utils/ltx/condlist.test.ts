import { describe, expect, it } from "@jest/globals";

import {
  addInfo,
  callEffect,
  checkChance,
  checkCondition,
  checkHasInfo,
  checkNoCondition,
  checkNoInfo,
  createCondlist,
  joinCondlists,
  removeInfo,
} from "#/utils/ltx/condlist";

describe("condlist creation utils", () => {
  it("should correctly join condlists", () => {
    const first: string =
      "{=hit_by_actor =hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r:) -zat_b106_one_shot} " +
      "%+zat_b106_one_shot +zat_b108_actor_damaged_chimera +zat_b106_ahtung%";
    const second: string =
      "{=hit_by_actor !hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r:) -zat_b108_actor_damaged_chimera} " +
      "%+zat_b108_actor_damaged_chimera%";

    expect(joinCondlists(first, second)).toBe(
      "{=hit_by_actor =hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r:) -zat_b106_one_shot} " +
        "%+zat_b106_one_shot +zat_b108_actor_damaged_chimera +zat_b106_ahtung%, " +
        "{=hit_by_actor !hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r:) -zat_b108_actor_damaged_chimera} " +
        "%+zat_b108_actor_damaged_chimera%"
    );

    expect(
      joinCondlists(
        createCondlist({ condition: [checkHasInfo("info")], value: "ab" }),
        createCondlist({ condition: [checkHasInfo("another")], value: "cd" }),
        createCondlist(true)
      )
    ).toBe("{+info} ab, {+another} cd, true");
  });

  it("should correctly create condlist", () => {
    expect(createCondlist()).toBe("true");
    expect(createCondlist({})).toBe("true");
    expect(createCondlist({ value: "example" })).toBe("example");
    expect(createCondlist({ condition: [checkHasInfo("info")], value: "ab" })).toBe("{+info} ab");
    expect(createCondlist({ action: [addInfo("ex_info")] })).toBe("%+ex_info%");
    expect(createCondlist({ action: [addInfo("ex_info"), removeInfo("an_info")] })).toBe("%+ex_info -an_info%");
    expect(createCondlist({ value: "ex", action: [addInfo("ex_info")] })).toBe("ex %+ex_info%");
    expect(
      createCondlist({
        value: "abc",
        condition: [checkHasInfo("ex_info"), checkCondition("some_cb", true, "d", 1), checkNoCondition("is_rainy")],
      })
    ).toBe("{+ex_info =some_cb(true:d:1) !is_rainy} abc");

    expect(
      createCondlist({
        condition: [
          checkCondition("hit_by_actor"),
          checkCondition("hitted_on_bone", "head_boss", "boss_jaw", "brow", "ear_r", "eye_l", "eye_r"),
          checkNoInfo("zat_b106_one_shot"),
        ],
        action: [addInfo("zat_b106_one_shot"), addInfo("zat_b108_actor_damaged_chimera"), addInfo("zat_b106_ahtung")],
      })
    ).toBe(
      "{=hit_by_actor =hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r) -zat_b106_one_shot} " +
        "%+zat_b106_one_shot +zat_b108_actor_damaged_chimera +zat_b106_ahtung%"
    );
  });

  it("should correctly create condition positive check", () => {
    expect(checkCondition("hitted_on_bone", "head_boss", "boss_jaw", "brow", "ear_r", "eye_l", "eye_r")).toBe(
      "=hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r)"
    );
  });

  it("should correctly create condition negative check", () => {
    expect(checkNoCondition("hitted_on_bone", "head_boss", "boss_jaw", "brow", "ear_r", "eye_l", "eye_r")).toBe(
      "!hitted_on_bone(head_boss:boss_jaw:brow:ear_r:eye_l:eye_r)"
    );
  });

  it("should correctly create chance negative check", () => {
    expect(checkChance(50)).toBe("~50");
    expect(checkChance(25)).toBe("~25");
    expect(checkChance(1)).toBe("~1");
    expect(checkChance(99)).toBe("~99");

    expect(() => checkChance(-1)).toThrow();
    expect(() => checkChance(0)).toThrow();
    expect(() => checkChance(100)).toThrow();
    expect(() => checkChance(1000)).toThrow();
  });

  it("should correctly create info portion positive check", () => {
    expect(checkHasInfo("some_info")).toBe("+some_info");
    expect(checkHasInfo("another_info")).toBe("+another_info");
  });

  it("should correctly create info portion negative check", () => {
    expect(checkNoInfo("some_info")).toBe("-some_info");
    expect(checkNoInfo("another_info")).toBe("-another_info");
  });

  it("should correctly create info portion addition effect", () => {
    expect(addInfo("some_info")).toBe("+some_info");
    expect(addInfo("another_info")).toBe("+another_info");
  });

  it("should correctly create info portion removal effect", () => {
    expect(removeInfo("some_info")).toBe("-some_info");
    expect(removeInfo("another_info")).toBe("-another_info");
  });

  it("should correctly create function call effect", () => {
    expect(callEffect("some_callback")).toBe("=some_callback");
    expect(callEffect("another_callback", "a", "b", "c")).toBe("=another_callback(a:b:c)");
  });
});
