import { beforeEach, describe, expect, it } from "@jest/globals";
import { MockAlifeCreatureActor, MockAlifeOnlineOfflineGroup, MockAlifeSimulator, MockIniFile } from "xray16/mocks";

import { registry } from "@/engine/core/database/registry";
import {
  initializeSimulationObjectProperties,
  registerSimulationObject,
  registerSimulator,
  unregisterSimulationObject,
  updateSimulationObjectAvailability,
} from "@/engine/core/database/simulation";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { resetRegistry } from "@/fixtures/engine";

describe("simulation module of the database", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("registerSimulator should correctly register simulator", () => {
    expect(registry.simulator).toBeNull();

    registerSimulator();

    expect(registry.simulator).toBe(MockAlifeSimulator.getInstance());
  });

  it("updateSimulationObjectAvailability should update availability", () => {
    const objectMock: TSimulationObject = { id: 400, isSimulationAvailable: () => true } as TSimulationObject;

    updateSimulationObjectAvailability(objectMock);

    expect(table.size(registry.simulationObjects)).toBe(1);
    expect(registry.simulationObjects.get(400)).toBe(objectMock);

    objectMock.isSimulationAvailable = () => false;
    updateSimulationObjectAvailability(objectMock);

    expect(table.size(registry.simulationObjects)).toBe(0);
    expect(registry.simulationObjects.get(400)).toBeNull();
  });

  it("should correctly register simulation objects", () => {
    const object: TSimulationObject = MockAlifeOnlineOfflineGroup.mock() as TSimulationObject;

    object.isSimulationAvailable = () => true;

    registerSimulationObject(object);

    expect(registry.simulationObjects.get(object.id)).toBe(object);

    expect(object.simulationProperties).toEqualLuaTables({
      first: 0,
      second: 0,
    });
    expect(object.isSimulationAvailableConditionList).toEqualLuaTables(
      parseConditionsList("{+test_squad} true, false")
    );
  });

  it("should correctly unregister simulation objects", () => {
    const simulationObject: TSimulationObject = MockAlifeOnlineOfflineGroup.mock() as TSimulationObject;

    simulationObject.isSimulationAvailable = () => true;

    registerSimulationObject(simulationObject);
    expect(table.size(registry.simulationObjects)).toBe(1);

    unregisterSimulationObject(simulationObject);
    expect(table.size(registry.simulationObjects)).toBe(0);
  });

  it("should correctly initialize simulation objects properties", () => {
    const simulationObject: TSimulationObject = MockAlifeCreatureActor.mock() as TSimulationObject;

    simulationObject.isSimulationAvailable = () => true;

    initializeSimulationObjectProperties(
      simulationObject,
      MockIniFile.mock("test.ltx", {
        actor: {
          sim_avail: "{+test} a, b",
          a: 1,
          b: 2,
        },
      })
    );

    expect(simulationObject.isSimulationAvailableConditionList).toEqualLuaTables(parseConditionsList("{+test} a, b"));
    expect(simulationObject.simulationProperties).toEqualLuaTables({ a: 1, b: 2 });
  });
});
