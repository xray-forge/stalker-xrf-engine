import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { anomalyHasArtefact } from "@/engine/core/utils/anomaly";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/anomaly");
beforeAll(() => {
  require("@/engine/declarations/conditions/world/anomaly_has_artefact");
});

describe("anomaly_has_artefact", () => {
  it("should check anomalies", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(anomalyHasArtefact, () => true);
    expect(callXrCondition("anomaly_has_artefact", actorGameObject, object, "anomaly-1", "artefact-1")).toBe(true);
    expect(anomalyHasArtefact).toHaveBeenCalledWith("anomaly-1", "artefact-1");

    replaceFunctionMock(anomalyHasArtefact, () => false);
    expect(
      callXrCondition("anomaly_has_artefact", actorGameObject, MockGameObject.mock(), "anomaly-2", "artefact-2")
    ).toBe(false);
    expect(anomalyHasArtefact).toHaveBeenCalledWith("anomaly-2", "artefact-2");
  });
});
