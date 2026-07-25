import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { registerObject, registry } from "@/engine/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCombatCamper } from "@/engine/core/schemes/stalker/combat_camper/evaluator/EvaluatorCombatCamper";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("EvaluatorCombatCamper", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should check registered script combat type of the object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
    const evaluator: EvaluatorCombatCamper = new EvaluatorCombatCamper(state);

    registerObject(object);
    evaluator.setup(object, MockPropertyStorage.mock());

    expect(evaluator.evaluate()).toBe(false);

    registry.objects.get(object.id()).scriptCombatType = EScriptCombatType.ZOMBIED;
    expect(evaluator.evaluate()).toBe(false);

    registry.objects.get(object.id()).scriptCombatType = EScriptCombatType.CAMPER;
    expect(evaluator.evaluate()).toBe(true);
  });
});
