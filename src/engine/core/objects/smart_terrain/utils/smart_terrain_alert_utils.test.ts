import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  ESmartTerrainStatus,
  SmartTerrain,
  SmartTerrainControl,
  syncObjectHitSmartTerrainAlert,
} from "@/engine/core/objects/smart_terrain";
import { EGameObjectRelation, GameObject, TRelationType } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("syncObjectHitSmartTerrainAlert", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should check terrains in radius", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
    const first: SmartTerrain = MockSmartTerrain.mock();
    const second: SmartTerrain = MockSmartTerrain.mock();
    const third: SmartTerrain = MockSmartTerrain.mock();

    first.on_before_register();
    second.on_before_register();
    third.on_before_register();

    syncObjectHitSmartTerrainAlert(object);

    third.smartTerrainActorControl = new SmartTerrainControl(
      third,
      MockIniFile.mock("test.ltx", {
        test_control: {
          noweap_zone: "no_weap_test",
          ignore_zone: "ignore_zone_test",
          alarm_start_sound: "start_sound.ogg",
          alarm_stop_sound: "stop_sound.ogg",
        },
      }),
      "test_control"
    );
    third.smartTerrainActorControl.status = ESmartTerrainStatus.NORMAL;

    jest.spyOn(third.smartTerrainActorControl, "onActorAttackSmartTerrain").mockImplementation(jest.fn());
    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 6_401);

    syncObjectHitSmartTerrainAlert(object);

    expect(third.smartTerrainActorControl.onActorAttackSmartTerrain).not.toHaveBeenCalled();

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 6_400);
    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);

    syncObjectHitSmartTerrainAlert(object);

    expect(third.smartTerrainActorControl.onActorAttackSmartTerrain).toHaveBeenCalledTimes(0);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 6_400);
    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.NEUTRAL as TRelationType);

    syncObjectHitSmartTerrainAlert(object);

    expect(third.smartTerrainActorControl.onActorAttackSmartTerrain).toHaveBeenCalledTimes(1);
  });
});
