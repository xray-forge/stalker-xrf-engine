import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";
import { registerGameClasses } from "@/engine/scripts/register/class_registrator";
import { getGameClassId } from "@/engine/scripts/register/game_class_id_registrator";
import { getUiClassId } from "@/engine/scripts/register/ui_class_id_registrator";

jest.mock("@/engine/scripts/register/class_registrator");
jest.mock("@/engine/scripts/register/game_class_id_registrator");
jest.mock("@/engine/scripts/register/ui_class_id_registrator");

function checkBinding(name: string, container: AnyObject = global): void {
  expect(container["register"]).toBeDefined();
  expect(typeof container["register"]).toBe("object");
  expect(typeof container["register"][name]).toBe("function");
}

function callBinding(name: string, container: AnyObject = global): void {
  return container["register"][name]();
}

describe("register entry point declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/register");
  });

  it("should correctly inject registering methods for game", () => {
    checkBinding("registerGameClasses");
    checkBinding("getGameClassId");
    checkBinding("getUiClassId");
  });
});

describe("register entry point execution", () => {
  beforeAll(() => {
    require("@/engine/scripts/register");
  });

  it("registerGameClasses should correctly call class registration", () => {
    callBinding("registerGameClasses");

    expect(registerGameClasses).toHaveBeenCalledTimes(1);
  });

  it("registerGameClasses should correctly call game types registration", () => {
    callBinding("getGameClassId");

    expect(getGameClassId).toHaveBeenCalledTimes(1);
  });

  it("registerGameClasses should correctly call ui class registration", () => {
    callBinding("getUiClassId");

    expect(getUiClassId).toHaveBeenCalledTimes(1);
  });
});
