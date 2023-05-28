import { describe, expect, it } from "@jest/globals";

import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  registerObjectStoryLinks,
  registerStoryLink,
  unregisterStoryLinkByObjectId,
  unregisterStoryLinkByStoryId,
} from "@/engine/core/database/story_objects";
import { ClientObject, ServerObject } from "@/engine/lib/types";
import { FILES_MOCKS, MockAlifeSimulator, mockClientGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("'story_objects' module of the database", () => {
  const firstObject: ServerObject = mockServerAlifeObject({ id: 12 });
  const secondObject: ServerObject = mockServerAlifeObject({ id: 36 });

  MockAlifeSimulator.addToRegistry(firstObject);
  MockAlifeSimulator.addToRegistry(secondObject);

  it("should correctly register object story links", () => {
    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    FILES_MOCKS["spawn.ini"].story_object["story_id"] = "SID_1";
    registerObjectStoryLinks(firstObject);

    FILES_MOCKS["spawn.ini"].story_object["story_id"] = "SID_2";
    registerObjectStoryLinks(secondObject);

    expect(registry.storyLink.idBySid.length()).toBe(2);
    expect(registry.storyLink.sidById.length()).toBe(2);

    expect(registry.storyLink.idBySid.get("SID_1")).toBe(12);
    expect(registry.storyLink.idBySid.get("SID_2")).toBe(36);
    expect(registry.storyLink.sidById.get(12)).toBe("SID_1");
    expect(registry.storyLink.sidById.get(36)).toBe("SID_2");

    unregisterStoryLinkByObjectId(12);

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(registry.storyLink.sidById.get(12)).toBeNull();
    expect(registry.storyLink.idBySid.get("SID_1")).toBeNull();

    unregisterStoryLinkByObjectId(36);

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly handle lifecycle and get links with utils", () => {
    const clientObject: ClientObject = mockClientGameObject({ idOverride: 12 });

    registerObject(clientObject);
    registerStoryLink(12, "test-sid");

    expect(getObjectByStoryId("test-sid")).toBe(clientObject);
    expect(getServerObjectByStoryId("test-sid")).toBe(firstObject);
    expect(getObjectIdByStoryId("test-sid")).toBe(12);
    expect(getStoryIdByObjectId(12)).toBe("test-sid");

    unregisterObject(clientObject);
    unregisterStoryLinkByStoryId("test-sid");
  });
});
