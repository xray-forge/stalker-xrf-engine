import { beforeEach, describe, expect, it } from "@jest/globals";

import { CheckContext } from "@/engine/checks/framework/core";
import {
  clearCurrentContext,
  drainRegistration,
  expect as flowExpect,
  expectEqual as flowExpectEqual,
  expectNoThrow as flowExpectNoThrow,
  fail as flowFail,
  IRegistration,
  requires,
  setCurrentContext,
  step,
} from "@/engine/checks/framework/dsl";

describe("registration", () => {
  beforeEach(() => {
    drainRegistration();
    clearCurrentContext();
  });

  it("should collect steps in declaration order", () => {
    step("first", { reached: () => true });
    step("second", { reached: () => false, handOff: "do a thing" });

    const registration: IRegistration = drainRegistration();

    expect(registration.steps.length()).toBe(2);
    expect(registration.steps.get(1).name).toBe("first");
    expect(registration.steps.get(2).name).toBe("second");
    expect(registration.steps.get(2).handOff).toBe("do a thing");
  });

  it("should empty the buffer when drained, so a second require cannot double register", () => {
    step("only", { reached: () => true });

    expect(drainRegistration().steps.length()).toBe(1);
    expect(drainRegistration().steps.length()).toBe(0);
  });

  it("should let the last requires call win", () => {
    requires({ level: "zaton" });
    requires({ level: "jupiter" });

    expect(drainRegistration().requirements?.level).toBe("jupiter");
  });

  it("should keep the reached predicate of a step declaring nothing else", () => {
    step("bare", { reached: () => true });

    const registration: IRegistration = drainRegistration();

    expect(registration.steps.get(1).name).toBe("bare");
    expect(registration.steps.get(1).reached()).toBe(true);
  });
});

describe("assertions", () => {
  beforeEach(() => {
    drainRegistration();
    clearCurrentContext();
  });

  it("should abort when asserted outside a running step", () => {
    expect(() => flowExpect(true, "label", "detail")).toThrow();
    expect(() => flowExpectEqual(1, 1, "label")).toThrow();
    expect(() => flowFail("label", "detail")).toThrow();
    expect(() => flowExpectNoThrow(() => undefined, "label", "detail")).toThrow();
  });

  it("should record into the current context", () => {
    const context: CheckContext = new CheckContext("test");

    setCurrentContext(context);

    flowExpect(true, "passes", "detail");
    flowExpect(false, "fails", "why it failed");
    flowExpectEqual(1, 2, "mismatch");
    flowFail("direct", "recorded without evaluating anything");

    clearCurrentContext();

    expect(context.checked).toBe(3);
    expect(context.failures.length()).toBe(3);
    expect(context.failures.get(1).assertion).toBe("fails");
    expect(context.failures.get(1).detail).toBe("why it failed");
    expect(context.failures.get(2).detail).toBe("expected '2', got '1'");
    expect(context.failures.get(3).assertion).toBe("direct");
  });

  it("should record an aborting callable rather than letting it escape", () => {
    const context: CheckContext = new CheckContext("test");

    setCurrentContext(context);

    const completed: boolean = flowExpectNoThrow(() => undefined, "fine", "detail");
    const aborted: boolean = flowExpectNoThrow(() => error("boom"), "broken", "what was attempted");

    clearCurrentContext();

    expect(completed).toBe(true);
    expect(aborted).toBe(false);
    expect(context.failures.length()).toBe(1);
    expect(context.failures.get(1).assertion).toBe("broken");
  });

  it("should stop recording once the context is cleared", () => {
    const context: CheckContext = new CheckContext("test");

    setCurrentContext(context);
    flowExpect(false, "recorded", "detail");
    clearCurrentContext();

    expect(() => flowExpect(false, "not recorded", "detail")).toThrow();
    expect(context.failures.length()).toBe(1);
  });
});
