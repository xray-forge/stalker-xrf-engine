import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeItemArtefact, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registerAnomalyZone, registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/pick_artefact_from_anomaly");
});

beforeEach(() => {
  resetRegistry();
});

describe("pick_artefact_from_anomaly", () => {
  it("should release the matching artefact and spawn it for the target object", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 101, section: "af_test" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");
    jest.spyOn(zone, "onArtefactTaken");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      object,
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(zone.onArtefactTaken).toHaveBeenCalledWith(artefact.id);
    expect(registry.simulator.release).toHaveBeenCalledWith(artefact, true);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "af_test",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

  it("should resolve the target object through its story id", () => {
    const stalker = MockAlifeHumanStalker.mock({ id: 111 });
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 112, section: "af_test" });

    registerSimulator();
    registerAnomalyZone(zone);
    registerStoryLink(stalker.id, "anomaly-target");
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");
    jest.spyOn(zone, "onArtefactTaken");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      null as unknown as GameObject,
      "anomaly-target",
      zone.object.name(),
      "af_test"
    );

    expect(zone.onArtefactTaken).toHaveBeenCalledWith(artefact.id);
  });

  it("should take the first artefact when no section is requested", () => {
    const object: GameObject = MockGameObject.mock();
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 121, section: "af_other" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");

    callXrEffect("pick_artefact_from_anomaly", MockGameObject.mockActor(), object, undefined, zone.object.name());

    expect(registry.simulator.release).toHaveBeenCalledWith(artefact, true);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      "af_other",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });

  it("should do nothing when the zone has no spawned artefacts", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerSimulator();
    registerAnomalyZone(zone);
    zone.spawnedArtefactsCount = 0;

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });

  it("should do nothing when the requested section is not in the zone", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());
    const artefact = MockAlifeItemArtefact.mock({ id: 131, section: "af_other" });

    registerSimulator();
    registerAnomalyZone(zone);
    MockAlifeSimulator.addToRegistry(artefact);
    zone.spawnedArtefactsCount = 1;
    zone.artefactPathsByArtefactId.set(artefact.id, "artefact-path");

    callXrEffect(
      "pick_artefact_from_anomaly",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      undefined,
      zone.object.name(),
      "af_test"
    );

    expect(registry.simulator.release).not.toHaveBeenCalled();
  });

  it("should reject an unknown story id, a dead target, and an unknown anomaly zone", () => {
    const zone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    registerSimulator();
    registerAnomalyZone(zone);

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        null as unknown as GameObject,
        "missing-story-id",
        zone.object.name(),
        "af_test"
      )
    ).toThrow();

    const deadStalker = MockAlifeHumanStalker.mock({ id: 141 });

    jest.spyOn(deadStalker, "alive").mockReturnValue(false);
    registerStoryLink(deadStalker.id, "dead-target");

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        null as unknown as GameObject,
        "dead-target",
        zone.object.name(),
        "af_test"
      )
    ).toThrow();

    expect(() =>
      callXrEffect(
        "pick_artefact_from_anomaly",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        undefined,
        "missing-zone",
        "af_test"
      )
    ).toThrow();
  });
});
