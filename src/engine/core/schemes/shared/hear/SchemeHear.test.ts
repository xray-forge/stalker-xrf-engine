import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { snd_type } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyObject } from "xray16/lib";
import { MockGameObject, MockIniFile, MockVector } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { ESoundType } from "@/engine/constants/sound";
import { IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { switchObjectSchemeToSection } from "@/engine/core/schemes/runtime";
import { SchemeHear } from "@/engine/core/schemes/shared/hear/SchemeHear";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  switchObjectSchemeToSection: jest.fn(),
}));

/**
 * Register object with a hear section applied through scheme reset.
 */
function registerObjectWithHear(object: GameObject, lines: Record<string, string>): IRegistryObjectState {
  const state: IRegistryObjectState = registerObject(object);

  state.ini = MockIniFile.mock("test.ltx", { "hear@test": lines });

  SchemeHear.reset(object, EScheme.HEAR, state, "hear@test");

  return state;
}

describe("SchemeHear", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(switchObjectSchemeToSection);
    mockRegisteredActor();
  });

  it("should be correctly defined", () => {
    expect(SchemeHear.SCHEME_SECTION).toBe("hear");
    expect(SchemeHear.SCHEME_SECTION).toBe(EScheme.HEAR);
    expect(SchemeHear.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should skip reset for missing section", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {});

    SchemeHear.reset(object, EScheme.HEAR, state, "hear@not_existing");

    expect(state.hearInfo).toBeUndefined();
  });

  it("should parse only on_sound lines into hear info", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObjectWithHear(object, {
      on_sound: "any|WPN|30|0.5|hear@next",
      on_sound1: "trader_sid|anomaly|10|0.1|hear@another",
      unrelated: "should|be|skipped",
    });

    expect(Object.keys(state.hearInfo as AnyObject)).toEqual(["any", "trader_sid"]);
    expect(state.hearInfo!["any"][ESoundType.WPN]).toEqual({
      dist: 30,
      power: 0.5,
      condlist: parseConditionsList("hear@next"),
    });
    expect(state.hearInfo!["trader_sid"]["anomaly"]).toEqual({
      dist: 10,
      power: 0.1,
      condlist: parseConditionsList("hear@another"),
    });
  });

  it("should notify danger manager about heard sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const dangerManager = { onHear: jest.fn() };

    setSchemeState(
      state,
      EScheme.DANGER,
      mockSchemeState<ISchemeDangerState>(EScheme.DANGER, { dangerManager } as AnyObject)
    );

    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(1, 1, 1), 0.5);

    expect(dangerManager.onHear).toHaveBeenCalledWith(object, 500, snd_type.weapon, MockVector.create(1, 1, 1), 0.5);
  });

  it("should do nothing without configured hear info", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(1, 1, 1), 0.5);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();
  });

  it("should do nothing for sound class without configured rule", () => {
    const object: GameObject = MockGameObject.mock();

    registerObjectWithHear(object, { on_sound: "any|WPN|30|0.1|hear@next" });

    SchemeHear.onObjectHearSound(object, 500, snd_type.monster, MockVector.create(1, 1, 1), 0.5);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();
  });

  it("should ignore sound that is too far or too quiet", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });

    registerObjectWithHear(object, { on_sound: "any|WPN|1|0.5|hear@next" });

    // Distance above configured limit.
    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(50, 50, 50), 0.9);
    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();

    // Power below configured limit.
    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(0, 0, 0), 0.1);
    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();
  });

  it("should switch scheme for matching sound rule", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const state: IRegistryObjectState = registerObjectWithHear(object, { on_sound: "any|WPN|100|0.1|hear@next" });

    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(1, 1, 1), 0.5);

    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "hear@next");
  });

  it("should resolve rules by story id of the sound source", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const source: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObjectWithHear(object, {
      on_sound: "source_sid|WPN|100|0.1|hear@from_story",
    });

    registerStoryLink(source.id(), "source_sid");

    SchemeHear.onObjectHearSound(object, source.id(), snd_type.weapon, MockVector.create(1, 1, 1), 0.5);

    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "hear@from_story");
  });

  it("should keep the rule when condlist does not resolve to a section", () => {
    const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const state: IRegistryObjectState = registerObjectWithHear(object, {
      on_sound: "any|WPN|100|0.1|{+not_existing_info} hear@next",
    });

    SchemeHear.onObjectHearSound(object, 500, snd_type.weapon, MockVector.create(1, 1, 1), 0.5);

    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();
    // Unsatisfied condlists resolve to `null`, never to an empty string, so the rule is not dropped.
    expect(state.hearInfo!["any"][ESoundType.WPN]).not.toBeNull();
  });
});
