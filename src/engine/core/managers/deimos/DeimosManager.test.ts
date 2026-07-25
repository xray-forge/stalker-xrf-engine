import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockNetProcessor } from "xray16/mocks";

import { getManager, registerZone, registry } from "@/engine/core/database";
import { DeimosManager } from "@/engine/core/managers/deimos";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("DeimosManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should save and restore the active Deimos intensity", () => {
    const zone: GameObject = MockGameObject.mock();
    const processor: MockNetProcessor = new MockNetProcessor();

    registerZone(zone);
    registry.objects.get(zone.id()).activeScheme = EScheme.SR_DEIMOS;
    setSchemeState(
      registry.objects.get(zone.id()),
      EScheme.SR_DEIMOS,
      mockSchemeState<ISchemeDeimosState>(EScheme.SR_DEIMOS, { intensity: 0.45 })
    );

    getManager(DeimosManager).save(processor.asNetPacket());
    getManager(DeimosManager).load(processor.asNetReader());

    expect(getManager(DeimosManager).consumeRestoredIntensity()).toBe(0.45);
    expect(getManager(DeimosManager).consumeRestoredIntensity()).toBeNull();
    expect(processor.dataList).toHaveLength(0);
  });

  it("should save an empty Deimos snapshot when no restrictor is active", () => {
    const processor: MockNetProcessor = new MockNetProcessor();

    getManager(DeimosManager).save(processor.asNetPacket());
    getManager(DeimosManager).load(processor.asNetReader());

    expect(getManager(DeimosManager).consumeRestoredIntensity()).toBeNull();
    expect(processor.dataList).toHaveLength(0);
  });
});
