import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { resetFunctionMock } from "xray16/testing/utils";

import { levels } from "@/engine/constants/levels";
import { storyNames } from "@/engine/constants/story_names";
import { registerStoryLink } from "@/engine/core/database";
import { addGuiderSpot, removeGuiderSpot } from "@/engine/core/managers/tasks/utils/tasks_generic";
import { resetRegistry } from "@/fixtures/engine";

describe("addGuiderSpot", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(level.map_add_object_spot);
    resetFunctionMock(level.map_remove_object_spot);
  });

  it("should replace the opposite spot with the configured guider mark", () => {
    registerStoryLink(100, storyNames.zat_b215_stalker_guide_zaton);

    addGuiderSpot(levels.zaton, levels.jupiter, true);

    expect(level.map_remove_object_spot).toHaveBeenCalledWith(100, "secondary_task_on_guider");
    expect(level.map_add_object_spot).toHaveBeenCalledWith(100, "storyline_task_on_guider", "");
  });
});

describe("removeGuiderSpot", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(level.map_remove_object_spot);
    jest.spyOn(level, "map_has_object_spot").mockReturnValue(1);
  });

  it("should remove both possible spots from every registered guider on the level", () => {
    registerStoryLink(100, storyNames.zat_b215_stalker_guide_zaton);

    removeGuiderSpot(levels.zaton);

    expect(level.map_remove_object_spot).toHaveBeenCalledWith(100, "storyline_task_on_guider");
    expect(level.map_remove_object_spot).toHaveBeenCalledWith(100, "secondary_task_on_guider");
  });
});
