import { describe, expect, it, jest } from "@jest/globals";

import { registerObject, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeWoundedState, PS_WOUNDED_FIGHT } from "@/engine/core/schemes/stalker/wounded";
import { EvaluatorCanFight } from "@/engine/core/schemes/stalker/wounded/evaluators/EvaluatorCanFight";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("EvaluatorCanFight", () => {
  it("should correctly evaluate whether object can fight", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const evaluator: EvaluatorCanFight = new EvaluatorCanFight(state);

    registerObject(object);

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(true);

    setPortableStoreValue(object.id(), PS_WOUNDED_FIGHT, "false");
    expect(evaluator.evaluate()).toBe(false);

    setPortableStoreValue(object.id(), PS_WOUNDED_FIGHT, "true");
    expect(evaluator.evaluate()).toBe(true);

    jest.spyOn(object, "critically_wounded").mockImplementation(() => true);
    expect(evaluator.evaluate()).toBe(true);
  });
});
