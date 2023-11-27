import { describe, expect, it, jest } from "@jest/globals";
import { property_storage } from "xray16";

import { EvaluatorDirectionSet } from "@/engine/core/ai/state/direction/EvaluatorDirectionSet";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockSightParameters } from "@/fixtures/xray";
import { MockCSightParams } from "@/fixtures/xray/mocks/CSightParams.mock";

describe("EvaluatorDirectionSet class", () => {
  it("should correctly perform direction check when look at object and activate callback", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorDirectionSet = new EvaluatorDirectionSet(manager);
    const endCallback = jest.fn();
    const lookObject = MockGameObject.mock();

    evaluator.setup(stalker.object, new property_storage());

    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.SMART_COVER);
    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(
      stalker.object,
      EStalkerState.BACKOFF,
      {
        turnEndCallback: endCallback,
        callback: null,
        context: {},
      },
      null,
      { lookObjectId: lookObject.id(), lookPosition: null }
    );
    expect(evaluator.evaluate()).toBeFalsy();

    replaceFunctionMock(stalker.object.sight_params, () => {
      const params = new MockSightParameters();

      params.m_sight_type = MockCSightParams.eSightTypeDirection;
      params.m_object = lookObject;
      params.m_vector = lookObject.position();

      return params;
    });
    manager.isObjectPointDirectionLook = true;
    expect(manager.callback?.turnEndCallback).not.toBeNull();

    expect(evaluator.evaluate()).toBeTruthy();
    expect(endCallback).toHaveBeenCalledTimes(1);
    expect(manager.callback?.turnEndCallback).toBeNull();

    unregisterStalker(stalker);
  });

  it("should correctly perform direction check by vector", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorDirectionSet = new EvaluatorDirectionSet(manager);
    const endCallback = jest.fn();
    const lookObject = MockGameObject.mock();

    evaluator.setup(stalker.object, new property_storage());

    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(
      stalker.object,
      EStalkerState.RAID_FIRE,
      {
        turnEndCallback: endCallback,
        callback: null,
        context: {},
      },
      null,
      { lookObjectId: null, lookPosition: lookObject.position() }
    );
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
