import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { getHelicopterHealth, isHelicopterAlive } from "@/engine/core/utils/helicopter";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockCHelicopter, MockGameObject } from "@/fixtures/xray";

describe("getHelicopterHealth util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check invulnerable state", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    expect(getHelicopterHealth(object.get_helicopter(), true)).toBe(1);
    expect(helicopter.SetfHealth).toHaveBeenCalledTimes(1);
    expect(helicopter.SetfHealth).toHaveBeenCalledWith(1);
  });

  it("should correctly check vulnerable state", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock(0.5);

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    expect(getHelicopterHealth(object.get_helicopter(), false)).toBe(0.5);
    expect(helicopter.SetfHealth).toHaveBeenCalledTimes(0);
  });

  it("should correctly check negative state", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock(-1);

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    expect(getHelicopterHealth(object.get_helicopter(), false)).toBe(0);
    expect(helicopter.SetfHealth).toHaveBeenCalledTimes(1);
    expect(helicopter.SetfHealth).toHaveBeenCalledWith(0);
  });
});

describe("isHelicopterAlive util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check invulnerable state", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock();
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    helicopter.SetfHealth(0);
    state.invulnerable = true;
    expect(isHelicopterAlive(object)).toBe(true);

    helicopter.SetfHealth(0);
    state.invulnerable = false;
    expect(isHelicopterAlive(object)).toBe(false);
  });

  it("should correctly check vulnerable state", () => {
    const object: GameObject = MockGameObject.mock();
    const helicopter: CHelicopter = MockCHelicopter.mock(0.5);

    registerObject(object);

    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    helicopter.SetfHealth(0.1);
    expect(isHelicopterAlive(object)).toBe(true);

    helicopter.SetfHealth(0.005);
    expect(isHelicopterAlive(object)).toBe(false);

    helicopter.SetfHealth(0);
    expect(isHelicopterAlive(object)).toBe(false);
  });
});
