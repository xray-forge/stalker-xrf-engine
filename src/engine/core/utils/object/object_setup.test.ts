import { describe, expect, it } from "@jest/globals";

import { registerActor } from "@/engine/core/database";
import { setupObjectInfoPortions, setupObjectStalkerVisual } from "@/engine/core/utils/object/object_setup";
import { ClientObject } from "@/engine/lib/types";
import { expectCallsToEqual } from "@/fixtures/jest";
import { mockActorClientGameObject, mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("object_setup utils", () => {
  it("setupObjectVisual should setup visuals", () => {
    const stalkerNone: ClientObject = mockClientGameObject({ section: <T>() => "stalker_none_1" as T });
    const stalkerFreedom: ClientObject = mockClientGameObject({ section: <T>() => "stalker_freedom_1" as T });
    const stalkerActor: ClientObject = mockClientGameObject({ section: <T>() => "stalker_actor_1" as T });

    registerActor(mockActorClientGameObject());

    setupObjectStalkerVisual(stalkerNone);
    expect(stalkerNone.set_visual_name).not.toHaveBeenCalled();

    setupObjectStalkerVisual(stalkerFreedom);
    expect(stalkerFreedom.set_visual_name).toHaveBeenCalledWith("actors\\stalker_neutral\\stalker_neutral_2");

    setupObjectStalkerVisual(stalkerActor);
    expect(stalkerActor.set_visual_name).toHaveBeenCalledWith("some_actor_visual");
  });

  it("setupObjectInfoPortions should setup info portions", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    setupObjectInfoPortions(first, mockIniFile("test.ltx", {}));

    expect(first.give_info_portion).not.toHaveBeenCalled();

    setupObjectInfoPortions(
      first,
      mockIniFile("test.ltx", {
        known_info: ["a", "b", "c"],
      })
    );
    expect(first.give_info_portion).toHaveBeenCalledTimes(3);
    expectCallsToEqual(first.give_info_portion, [["a"], ["b"], ["c"]]);

    setupObjectInfoPortions(
      second,
      mockIniFile("test.ltx", {
        custom_section: ["d", "e"],
      }),
      "custom_section"
    );
    expect(second.give_info_portion).toHaveBeenCalledTimes(2);
    expectCallsToEqual(second.give_info_portion, [["d"], ["e"]]);
  });
});