import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { anim, clsid, move } from "xray16";

import { TSimulationObject } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { updateObjectReachTaskMovement } from "@/engine/core/schemes/stalker/reach_task/utils/reach_task_utils";
import { GameObject, Vector } from "@/engine/lib/types";
import { MockGameObject, MockVector } from "@/fixtures/xray";

describe("updateObjectReachTaskMovement util", () => {
  beforeEach(() => {
    surgeConfig.IS_STARTED = false;
  });

  it("updateObjectReachTaskMovement should correctly set object movement when have not target or talking", () => {
    const object: GameObject = MockGameObject.mock();

    updateObjectReachTaskMovement(object, null);

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);
    expect(object.set_mental_state).not.toHaveBeenCalled();

    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    updateObjectReachTaskMovement(object, {} as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenNthCalledWith(2, move.stand);
    expect(object.set_mental_state).not.toHaveBeenCalled();
  });

  it("updateObjectReachTaskMovement should correctly set object movement when have surge active", () => {
    const object: GameObject = MockGameObject.mock();

    surgeConfig.IS_STARTED = true;

    updateObjectReachTaskMovement(object, {} as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);
    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);
  });

  it("updateObjectReachTaskMovement should correctly set object movement when have terrain target", () => {
    const object: GameObject = MockGameObject.mock();

    updateObjectReachTaskMovement(object, { clsid: () => clsid.smart_terrain } as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenCalledWith(move.walk);
    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);
  });

  it("updateObjectReachTaskMovement should correctly set object movement when have squad", () => {
    const object: GameObject = MockGameObject.mock();
    const squadPosition: Vector = MockVector.mock();

    jest.spyOn(squadPosition, "distance_to_sqr").mockImplementation(() => 10_000);

    updateObjectReachTaskMovement(object, {
      clsid: () => clsid.online_offline_group_s,
      position: squadPosition,
    } as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenNthCalledWith(1, move.run);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(1, anim.free);

    jest.spyOn(squadPosition, "distance_to_sqr").mockImplementation(() => 9999);

    updateObjectReachTaskMovement(object, {
      clsid: () => clsid.online_offline_group_s,
      position: squadPosition,
    } as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenNthCalledWith(2, move.run);
    expect(object.set_mental_state).toHaveBeenNthCalledWith(2, anim.danger);
  });
});
