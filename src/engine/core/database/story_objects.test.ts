import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerSimulator } from "@/engine/core/database/simulation";
import {
  getIdBySid,
  getObjectByStoryId,
  getObjectIdByStoryId,
  getServerObjectByStoryId,
  getStoryIdByObjectId,
  isStoryObject,
  isStoryObjectExisting,
  registerObjectStoryLinks,
  registerStoryLink,
  unregisterStoryLinkByObjectId,
  unregisterStoryLinkByStoryId,
} from "@/engine/core/database/story_objects";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { FILES_MOCKS, MockAlifeSimulator, mockGameObject, mockServerAlifeObject } from "@/fixtures/xray";

describe("story_objects module of the database", () => {
  const firstObject: ServerObject = mockServerAlifeObject({ id: 12 });
  const secondObject: ServerObject = mockServerAlifeObject({ id: 36 });

  MockAlifeSimulator.addToRegistry(firstObject);
  MockAlifeSimulator.addToRegistry(secondObject);

  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly register object story links", () => {
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

  it("should correctly register object story links from system ini", () => {
    const object: ServerObject = mockServerAlifeObject({
      section_name: <T extends string>(): T => "test_sid_section" as T,
    });

    delete FILES_MOCKS["spawn.ini"].story_object;

    FILES_MOCKS["system.ini"].test_sid_section = {
      story_id: "test_sid_system_ini",
    };

    registerObjectStoryLinks(object);

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);
    expect(registry.storyLink.sidById.get(object.id)).toBe("test_sid_system_ini");
    expect(registry.storyLink.idBySid.get("test_sid_system_ini")).toBe(object.id);
  });

  it("should correctly handle lifecycle and get links with utils", () => {
    const object: GameObject = mockGameObject({ idOverride: 12 });

    registerObject(object);
    registerStoryLink(12, "test-sid");

    expect(getObjectByStoryId("test-sid")).toBe(object);
    expect(getServerObjectByStoryId("test-sid")).toBe(firstObject);
    expect(getObjectIdByStoryId("test-sid")).toBe(12);
    expect(getStoryIdByObjectId(12)).toBe("test-sid");

    expect(getObjectByStoryId("not-defined")).toBeNull();
    expect(getServerObjectByStoryId("not-defined")).toBeNull();
    expect(getStoryIdByObjectId(5555)).toBeNull();

    unregisterObject(object);
    unregisterStoryLinkByStoryId("test-sid");
  });

  it("getObjectByStoryId should correctly fallback to level check", () => {
    const object: GameObject = mockGameObject({ idOverride: 12 });

    registerStoryLink(object.id(), "test-level-check");

    expect(getObjectByStoryId("test-level-check")).toBe(object);
  });

  it("isStoryObjectExisting should correctly check if object is existing", () => {
    expect(isStoryObjectExisting("test-sid")).toBe(false);

    const serverObject: ServerObject = mockServerAlifeObject();

    registerStoryLink(serverObject.id, "test-sid");

    expect(isStoryObjectExisting("test-sid")).toBe(true);
  });

  it("isStoryObject should correctly check if object is existing", () => {
    const serverObject: ServerObject = mockServerAlifeObject();
    const gameObject: GameObject = mockGameObject({ idOverride: serverObject.id });

    expect(isStoryObject(serverObject)).toBe(false);
    expect(isStoryObject(gameObject)).toBe(false);

    registerStoryLink(serverObject.id, "is-story-object-example");

    expect(isStoryObject(serverObject)).toBe(true);
    expect(isStoryObject(gameObject)).toBe(true);
  });

  it("registerStoryLink should correctly handle register duplicates", () => {
    const first: ServerObject = mockServerAlifeObject();
    const second: ServerObject = mockServerAlifeObject();

    registerStoryLink(first.id, "register-test-duplicate");
    expect(() => registerStoryLink(second.id, "register-test-duplicate")).toThrow();
  });

  it("registerStoryLink should correctly handle register twice as different", () => {
    const first: ServerObject = mockServerAlifeObject();

    registerStoryLink(first.id, "register-test-twice-first");
    expect(() => registerStoryLink(first.id, "register-test-twice-second")).toThrow();
  });

  it("getIdBySid should correctly get objects by SID", () => {
    const object: ServerObject = mockServerAlifeObject({ m_story_id: 400 });

    expect(getIdBySid(500)).toBeNull();
    expect(getIdBySid(400)).toBe(object.id);
  });
});
