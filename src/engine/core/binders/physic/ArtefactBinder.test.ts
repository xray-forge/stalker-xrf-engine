import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CArtefact } from "xray16";

import { ArtefactBinder } from "@/engine/core/binders/physic/ArtefactBinder";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import { registry } from "@/engine/core/database";
import { createVector } from "@/engine/core/utils/vector";
import { GameObject, PhysicsElement, PhysicsShell, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import {
  MockCArtefact,
  MockGameObject,
  MockIniFile,
  MockObjectBinder,
  MockPhysicsElement,
  MockPhysicsShell,
  MockServerAlifeCreatureAbstract,
} from "@/fixtures/xray";

describe("ArtefactBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);

    expect(binder.isNetSpawnToggled).toBe(false);
  });

  it("should correctly handle going online/offline when spawn check is falsy", () => {
    const serverObject: ServerObject = MockServerAlifeCreatureAbstract.mock();
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);
    const artefact: CArtefact = MockCArtefact.mock();

    jest.spyOn(object, "get_artefact").mockImplementation(() => artefact);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online/offline", () => {
    const serverObject: ServerObject = MockServerAlifeCreatureAbstract.mock();
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);
    const artefact: CArtefact = MockCArtefact.mock();
    const anomalyZone: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock());

    jest.spyOn(object, "get_artefact").mockImplementation(() => artefact);

    registry.artefacts.parentZones.set(object.id(), anomalyZone);
    registry.artefacts.ways.set(object.id(), object.name());
    registry.artefacts.points.set(object.id(), 100);

    anomalyZone.applyingForceXZ = 10;
    anomalyZone.applyingForceY = 15;

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(1);
    expect(binder.isNetSpawnToggled).toBe(true);
    expect(artefact.FollowByPath).toHaveBeenCalledTimes(1);
    expect(artefact.FollowByPath).toHaveBeenCalledWith(
      object.name(),
      100,
      createVector(anomalyZone.applyingForceXZ, anomalyZone.applyingForceY, anomalyZone.applyingForceXZ)
    );

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle update event when do not need init", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);

    binder.isNetSpawnToggled = false;

    binder.update(100);
  });

  it("should correctly handle update event when need init", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);

    binder.isNetSpawnToggled = true;

    binder.update(100);
  });

  it("should correctly handle update event when has shell with not fixed bone", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);
    const shell: PhysicsShell = MockPhysicsShell.mock();
    const element: PhysicsElement = MockPhysicsElement.mock();

    jest.spyOn(shell, "get_element_by_bone_name").mockImplementation(() => element);
    jest.spyOn(object, "get_physics_shell").mockImplementation(() => shell);
    jest.spyOn(element, "is_fixed").mockImplementation(() => false);

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        fixed_bone: {
          name: "test_name",
        },
      });
    });

    binder.isNetSpawnToggled = true;

    binder.update(100);

    expect(binder.isNetSpawnToggled).toBe(false);
    expect(element.fix).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle update event when has shell with fixed bone", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArtefactBinder = new ArtefactBinder(object);
    const shell: PhysicsShell = MockPhysicsShell.mock();
    const element: PhysicsElement = MockPhysicsElement.mock();

    jest.spyOn(shell, "get_element_by_bone_name").mockImplementation(() => element);
    jest.spyOn(object, "get_physics_shell").mockImplementation(() => shell);
    jest.spyOn(element, "is_fixed").mockImplementation(() => true);

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        fixed_bone: {
          name: "test_name",
        },
      });
    });

    binder.isNetSpawnToggled = true;

    binder.update(100);

    expect(binder.isNetSpawnToggled).toBe(false);
    expect(element.fix).toHaveBeenCalledTimes(0);
  });
});
