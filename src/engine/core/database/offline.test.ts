import { describe, expect, it } from "@jest/globals";

import {
  hardResetOfflineObject,
  registerOfflineObject,
  softResetOfflineObject,
  unregisterOfflineObject,
} from "@/engine/core/database/offline";
import { registry } from "@/engine/core/database/registry";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("offline database module", () => {
  it("should correctly register and unregister offline objects state", () => {
    const object: ClientObject = mockClientGameObject();

    expect(registerOfflineObject(object.id(), { activeSection: "test", levelVertexId: 1 })).toEqual({
      activeSection: "test",
      levelVertexId: 1,
    });
    expect(registerOfflineObject(object.id())).toEqual({
      activeSection: "test",
      levelVertexId: 1,
    });

    expect(registry.offlineObjects.length()).toBe(1);
    expect(registry.offlineObjects.get(object.id())).toEqual({
      activeSection: "test",
      levelVertexId: 1,
    });

    registry.offlineObjects.get(object.id()).levelVertexId = 255;

    expect(registry.offlineObjects.get(object.id())).toEqual({
      activeSection: "test",
      levelVertexId: 255,
    });
    expect(registerOfflineObject(object.id())).toEqual({
      activeSection: "test",
      levelVertexId: 255,
    });

    softResetOfflineObject(object.id(), { activeSection: null, levelVertexId: 5000 });
    expect(registry.offlineObjects.get(object.id())).toEqual({
      activeSection: null,
      levelVertexId: 5000,
    });

    softResetOfflineObject(MAX_I32);
    expect(registry.offlineObjects.get(MAX_I32)).toBeNull();

    hardResetOfflineObject(MAX_I32, { levelVertexId: 11, activeSection: null });
    expect(registry.offlineObjects.get(MAX_I32)).toEqual({
      activeSection: null,
      levelVertexId: 11,
    });

    registry.offlineObjects.get(object.id()).levelVertexId = 444;
    hardResetOfflineObject(object.id());

    expect(registry.offlineObjects.get(object.id())).toEqual({
      activeSection: null,
      levelVertexId: null,
    });

    unregisterOfflineObject(object.id());
    unregisterOfflineObject(MAX_I32);

    expect(registry.offlineObjects.length()).toBe(0);
  });
});
