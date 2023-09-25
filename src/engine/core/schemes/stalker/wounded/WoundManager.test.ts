import { describe, expect, it, jest } from "@jest/globals";

import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/ISchemeWoundedState";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("WoundManager class", () => {
  it.todo("should correctly handle updates");

  it.todo("should correctly medkit eating");

  it.todo("should correctly process fight");

  it.todo("should correctly process victim");

  it.todo("should correctly process hp wounds");

  it.todo("should correctly process psy wounds");

  it("should correctly handle hit events", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const manager: WoundManager = new WoundManager(object, state);

    jest.spyOn(manager, "update").mockImplementation(() => {});
    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "critically_wounded").mockImplementation(() => true);

    manager.onHit();
    expect(manager.update).not.toHaveBeenCalled();

    jest.spyOn(object, "alive").mockImplementation(() => true);
    manager.onHit();
    expect(manager.update).not.toHaveBeenCalled();

    jest.spyOn(object, "critically_wounded").mockImplementation(() => false);

    manager.onHit();
    expect(manager.update).toHaveBeenCalledTimes(1);
  });
});
