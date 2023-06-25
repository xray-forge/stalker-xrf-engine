import { describe, expect, it } from "@jest/globals";
import { alife, game_graph } from "xray16";

import { isObjectInZone, isObjectOnLevel } from "@/engine/core/utils/object/object_location";
import { ClientObject, ServerObject } from "@/engine/lib/types";
import { mockClientGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("object location utils", () => {
  it("'isObjectInZone' check object inside", () => {
    const object: ClientObject = mockClientGameObject();
    const zone: ClientObject = mockClientGameObject();

    expect(isObjectInZone(object, zone)).toBe(false);
    expect(zone.inside).toHaveBeenCalledWith(object.position());
    expect(isObjectInZone(null, null)).toBe(false);
    expect(isObjectInZone(object, null)).toBe(false);
    expect(isObjectInZone(null, zone)).toBe(false);
  });

  it("'isObjectOnLevel' check object inside", () => {
    const object: ServerObject = mockServerAlifeObject();

    expect(isObjectOnLevel(null, "zaton")).toBe(false);
    expect(isObjectOnLevel(object, "pripyat")).toBe(true);

    expect(game_graph().vertex(object.m_game_vertex_id).level_id()).toBe(1);
    expect(alife().level_name).toHaveBeenCalledWith(1);
  });
});
