import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { communities } from "@/engine/constants/communities";
import { registerObject } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCombatZombied } from "@/engine/core/schemes/stalker/combat_zombied/evaluators/EvaluatorCombatZombied";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createEvaluator(community: string): EvaluatorCombatZombied {
  const object: GameObject = MockGameObject.mock({ clsid: clsid.script_stalker, community });
  const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);
  const evaluator: EvaluatorCombatZombied = new EvaluatorCombatZombied(state);

  registerObject(object);
  evaluator.setup(object, MockPropertyStorage.mock());

  return evaluator;
}

describe("EvaluatorCombatZombied", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should apply zombied combat only for zombied community", () => {
    expect(createEvaluator(communities.zombied).evaluate()).toBe(true);
    expect(createEvaluator(communities.stalker).evaluate()).toBe(false);
    expect(createEvaluator(communities.monolith).evaluate()).toBe(false);
  });
});
