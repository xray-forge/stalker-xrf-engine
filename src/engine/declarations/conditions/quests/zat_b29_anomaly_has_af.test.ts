import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerObject } from "xray16/alias";
import { MockAlifeObject, MockGameObject } from "xray16/mocks";

import { TInfoPortion } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registerAnomalyZone, registerSimulator, registry } from "@/engine/core/database";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/zat_b29_anomaly_has_af");
});

describe("zat_b29_anomaly_has_af", () => {
  it("should check anomaly and artefact", () => {
    expect(callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const object: GameObject = MockGameObject.mock();
    const anomaly: AnomalyZoneBinder = new AnomalyZoneBinder(object);
    const artefact: ServerObject = MockAlifeObject.mock();

    mockRegisteredActor();
    registerAnomalyZone(anomaly);
    registerSimulator();

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    giveInfoPortion(zatB29InfopBringTable.get(23));

    anomaly.artefactPathsByArtefactId.set(artefact.id, "test");

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    anomaly.spawnedArtefactsCount = 10;

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    jest.spyOn(artefact, "section_name").mockImplementation(() => zatB29AfTable.get(23));

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(true);
  });

  it("should only check artefacts spawned in the provided anomaly zone", () => {
    mockRegisteredActor();
    registerSimulator();

    const first: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock({ name: "zat_b53_anomal_zone" }));
    const second: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock({ name: "zat_b55_anomal_zone" }));

    registerAnomalyZone(first);
    registerAnomalyZone(second);

    first.spawnedArtefactsCount = 1;
    second.spawnedArtefactsCount = 1;

    const artefact: ServerObject = MockAlifeObject.mock();

    jest.spyOn(artefact, "section_name").mockImplementation(() => zatB29AfTable.get(23));
    giveInfoPortion(zatB29InfopBringTable.get(23));

    // Artefact is spawned in the second zone only, while the global registry knows about it too.
    second.artefactPathsByArtefactId.set(artefact.id, "test");
    registry.artefacts.ways.set(artefact.id, "test");

    expect(
      callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock(), first.object.name())
    ).toBe(false);
    expect(hasInfoPortion(first.object.name() as TInfoPortion)).toBe(false);

    expect(
      callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock(), second.object.name())
    ).toBe(true);
    expect(hasInfoPortion(second.object.name() as TInfoPortion)).toBe(true);
  });
});
