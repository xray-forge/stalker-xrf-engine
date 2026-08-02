import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { detectors } from "@/engine/constants/items/detectors";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/get_best_detector");
});

describe("get_best_detector", () => {
  it("should force actor to select best detector", () => {
    const advancedDetector: GameObject = MockGameObject.mock({ section: detectors.detector_advanced });
    const scientificDetector: GameObject = MockGameObject.mock({ section: detectors.detector_scientific });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [advancedDetector.section(), advancedDetector],
        [scientificDetector.section(), scientificDetector],
      ],
    });

    callXrEffect("get_best_detector", actor, MockGameObject.mock());

    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledTimes(1);
    expect(advancedDetector.enable_attachable_item).toHaveBeenCalledWith(true);
    expect(scientificDetector.enable_attachable_item).toHaveBeenCalledTimes(0);
  });
});
