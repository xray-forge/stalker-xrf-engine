import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { EJobPathType, EJobType, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ESchemeType } from "@/engine/core/schemes/types";
import { callXrCondition, mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
});
beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_obj_on_job");
});

describe("is_obj_on_job", () => {
  it("should check if object is on job", () => {
    const object: GameObject = MockGameObject.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered("test-smart-terrain");

    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job")).toBe(false);
    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job", "test-smart-terrain")).toBe(
      false
    );

    terrain.objectJobDescriptors.set(1, {
      isMonster: false,
      object: MockAlifeHumanStalker.mock({ id: object.id() }),
      desiredJob: "",
      jobPriority: 0,
      jobId: 0,
      scanCursor: 1,
      job: {
        section: "test-job",
        type: EJobType.ANIMPOINT,
        pathType: EJobPathType.POINT,
        priority: 100,
      },
      isBegun: false,
      schemeType: ESchemeType.STALKER,
    });

    expect(callXrCondition("is_obj_on_job", MockGameObject.mockActor(), object, "test-job", "test-smart-terrain")).toBe(
      true
    );
  });
});
