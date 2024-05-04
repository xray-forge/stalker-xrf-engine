import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerStoryLink } from "@/engine/core/database";
import { updateAnomalyZonesDisplay } from "@/engine/core/managers/map/utils/map_spot_anomaly";
import { getAnomalyArtefacts } from "@/engine/core/utils/anomaly";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, replaceFunctionMockOnce } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/anomaly");

describe("updateAnomalyZonesDisplay util", () => {
  beforeEach(() => {
    resetRegistry();
    replaceFunctionMock(getAnomalyArtefacts, () => $fromArray([]));
  });

  it("should correctly update objects if info portion is available", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "jup_b32_spot");
    mockRegisteredActor();

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 1);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 0);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    giveInfoPortion(infoPortions.jup_b32_scanner_1_placed);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 1);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 0);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    giveInfoPortion(infoPortions.jup_b32_scanner_reward);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 0);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(0);

    jest.spyOn(level, "map_has_object_spot").mockImplementation(() => 1);
    updateAnomalyZonesDisplay();
    expect(level.map_change_spot_hint).toHaveBeenCalledTimes(1);
  });

  it("should correctly update label based on available artefacts in anomaly", () => {
    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "jup_b32_spot");
    mockRegisteredActor();
    giveInfoPortion(infoPortions.jup_b32_scanner_1_placed);
    giveInfoPortion(infoPortions.jup_b32_scanner_reward);

    replaceFunctionMockOnce(getAnomalyArtefacts, () => $fromArray(["first", "second"]));
    updateAnomalyZonesDisplay();

    expect(level.map_change_spot_hint).toHaveBeenCalledWith(
      object.id(),
      "primary_object",
      "translated_st_jup_b32_name\\n \\ntranslated_st_jup_b32_has_af" +
        "\\ntranslated_st_first_name\\ntranslated_st_second_name"
    );

    replaceFunctionMockOnce(getAnomalyArtefacts, () => $fromArray(["first"]));
    updateAnomalyZonesDisplay();

    expect(level.map_change_spot_hint).toHaveBeenCalledWith(
      object.id(),
      "primary_object",
      "translated_st_jup_b32_name\\n \\ntranslated_st_jup_b32_has_af" + "\\ntranslated_st_first_name"
    );

    replaceFunctionMockOnce(getAnomalyArtefacts, () => $fromArray([]));
    updateAnomalyZonesDisplay();

    expect(level.map_change_spot_hint).toHaveBeenCalledWith(
      object.id(),
      "primary_object",
      "translated_st_jup_b32_name\\n \\ntranslated_st_jup_b32_no_af"
    );
  });
});
