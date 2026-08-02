import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { detectors } from "@/engine/constants/items/detectors";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_active_detector");
});

describe("actor_active_detector", () => {
  it("should check currently active actor detector", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(() => callXrCondition("actor_active_detector", actor, MockGameObject.mock())).toThrow(
      "Wrong parameters in condition 'actor_active_detector', detector section is expected."
    );

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      false
    );

    jest
      .spyOn(actor, "active_detector")
      .mockImplementation(() => MockGameObject.mockWithSection(detectors.detector_simple));

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      false
    );
    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_simple)).toBe(
      true
    );

    jest
      .spyOn(actor, "active_detector")
      .mockImplementation(() => MockGameObject.mockWithSection(detectors.detector_scientific));

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      true
    );
    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_simple)).toBe(
      false
    );
  });
});
