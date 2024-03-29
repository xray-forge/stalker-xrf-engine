import { describe, expect, it } from "@jest/globals";

import { registerActor } from "@/engine/core/database";
import { setupObjectInfoPortions, setupObjectStalkerVisual } from "@/engine/core/utils/object/object_setup";
import { GameObject } from "@/engine/lib/types";
import { expectCallsToEqual } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("setupObjectVisual util", () => {
  it("should setup visuals", () => {
    const stalkerNone: GameObject = MockGameObject.mock({ section: "stalker_none_1" });
    const stalkerFreedom: GameObject = MockGameObject.mock({ section: "stalker_freedom_1" });
    const stalkerActor: GameObject = MockGameObject.mock({ section: "stalker_actor_1" });

    registerActor(MockGameObject.mockActor());

    setupObjectStalkerVisual(stalkerNone);
    expect(stalkerNone.set_visual_name).not.toHaveBeenCalled();

    setupObjectStalkerVisual(stalkerFreedom);
    expect(stalkerFreedom.set_visual_name).toHaveBeenCalledWith("actors\\stalker_neutral\\stalker_neutral_2");

    setupObjectStalkerVisual(stalkerActor);
    expect(stalkerActor.set_visual_name).toHaveBeenCalledWith("some_actor_visual");
  });
});

describe("setupObjectInfoPortions util", () => {
  it("should setup info portions", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    setupObjectInfoPortions(first, MockIniFile.mock("test.ltx", {}));

    expect(first.give_info_portion).not.toHaveBeenCalled();

    setupObjectInfoPortions(
      first,
      MockIniFile.mock("test.ltx", {
        known_info: ["a", "b", "c"],
      })
    );
    expect(first.give_info_portion).toHaveBeenCalledTimes(3);
    expectCallsToEqual(first.give_info_portion, [["a"], ["b"], ["c"]]);

    setupObjectInfoPortions(
      second,
      MockIniFile.mock("test.ltx", {
        custom_section: ["d", "e"],
      }),
      "custom_section"
    );
    expect(second.give_info_portion).toHaveBeenCalledTimes(2);
    expectCallsToEqual(second.give_info_portion, [["d"], ["e"]]);
  });
});
