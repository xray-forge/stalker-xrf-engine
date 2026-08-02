import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerCreatureObject } from "xray16/alias";
import { $fromArray } from "xray16/macros";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { IObjectJobState, ISmartTerrainJobDescriptor, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { callXrCondition, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/distance_to_obj_on_job_le");
});

describe("distance_to_obj_on_job_le", () => {
  it("should check object job distance", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();
    const working: ServerCreatureObject = MockAlifeHumanStalker.mock();

    MockAlifeHumanStalker.mock({ id: object.id() }).m_smart_terrain_id = terrain.id;

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test", 100)).toBe(false);

    terrain.objectJobDescriptors = $fromArray<IObjectJobState>([
      {
        object: working,
        job: {
          section: "test-job",
        } as ISmartTerrainJobDescriptor,
      } as IObjectJobState,
    ]);

    expect(
      callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-not-existing", 100)
    ).toBe(false);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 100 * 100);

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-job", 100)).toBe(
      true
    );
    expect(object.position().distance_to_sqr).toHaveBeenCalledWith(working.position);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 101 * 101);

    expect(callXrCondition("distance_to_obj_on_job_le", MockGameObject.mockActor(), object, "test-job", 100)).toBe(
      false
    );
  });
});
