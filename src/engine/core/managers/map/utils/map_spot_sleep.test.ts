import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { updateSleepZonesDisplay } from "@/engine/core/managers/map/utils/map_spot_sleep";
import { GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("updateSleepZonesDisplay util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(level.map_add_object_spot);
    resetFunctionMock(level.map_remove_object_spot);
  });

  it("should correctly update display for in-game sleep zones when near", () => {
    const { actorGameObject } = mockRegisteredActor();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "zat_a2_sr_sleep_id");
    registerStoryLink(second.id(), "jup_a6_sr_sleep_id");

    registerObject(first);
    registerObject(second);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 0);
    jest.spyOn(actorGameObject.position(), "distance_to").mockImplementation(() => 74);

    updateSleepZonesDisplay();

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(0);
    expect(level.map_add_object_spot).toHaveBeenCalledTimes(2);
    expect(level.map_add_object_spot).toHaveBeenCalledWith(
      first.id(),
      "ui_pda2_actor_sleep_location",
      "st_ui_pda_sleep_place"
    );
    expect(level.map_add_object_spot).toHaveBeenCalledWith(
      second.id(),
      "ui_pda2_actor_sleep_location",
      "st_ui_pda_sleep_place"
    );

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 1);

    updateSleepZonesDisplay();

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(0);
    expect(level.map_add_object_spot).toHaveBeenCalledTimes(2);

    jest.spyOn(actorGameObject.position(), "distance_to").mockImplementation(() => 76);

    updateSleepZonesDisplay();

    expect(level.map_remove_object_spot).toHaveBeenCalledTimes(2);
    expect(level.map_add_object_spot).toHaveBeenCalledTimes(2);
  });
});
