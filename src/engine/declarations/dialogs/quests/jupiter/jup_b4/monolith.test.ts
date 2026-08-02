import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isStalkerAlive } from "@/engine/core/utils/object";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/object");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function resetActor(): GameObject {
  resetRegistry();

  return mockRegisteredActor().actorGameObject;
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/jupiter/jup_b4/monolith"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isStalkerAlive);
});

describe("monolith_leader_is_alive", () => {
  it("should check the monolith skin leader while the squad kept its faction", () => {
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_monolith_skin");

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
  });

  it("should check the freedom skin leader once the squad joined Freedom", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_freedom_skin");

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");
  });

  it("should check the duty skin leader once the squad joined Duty", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => false);

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");
  });
});

describe("monolith_leader_dead_or_hired", () => {
  it("should accept a hired squad regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);
  });

  it("should invert the monolith skin leader state while the squad kept its faction", () => {
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);
  });

  it("should invert the faction skin leader state once the squad joined a faction", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");

    resetActor();

    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");
  });
});

describe("monolith_leader_dead_or_dolg", () => {
  it("should accept the Freedom faction regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);
  });

  it("should still require a dead duty skin leader once the squad joined Duty", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);
  });

  it("should accept a hired squad and follow the monolith leader otherwise", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);

    resetActor();

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
  });
});

describe("monolith_leader_dead_or_freedom", () => {
  it("should accept the Duty faction regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);
  });

  it("should still require a dead freedom skin leader once the squad joined Freedom", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);
  });

  it("should accept a hired squad and follow the monolith leader otherwise", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);

    resetActor();

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
  });
});
