import { expect } from "@jest/globals";
import { ActionBase } from "xray16/alias";
import { AnyArgs, Nillable } from "xray16/lib";
import { MockActionBase } from "xray16/mocks";

/**
 * Util to check GOAP action setup in graph.
 *
 * @param action - Target action to check.
 * @param target - Target action to compare with (name or class of implementation).
 * @param properties - Expected properties of provided action.
 * @param effects - Expected effects of provided action.
 */
export function checkPlannerAction(
  action: Nillable<MockActionBase | ActionBase>,
  target: string | { new (...args: AnyArgs): ActionBase },
  properties: Array<[number, boolean]>,
  effects: Array<[number, boolean]>
): void {
  const base: MockActionBase = action as unknown as MockActionBase;

  expect(base).toBeDefined();

  if (typeof target === "string") {
    expect(base.name).toBe(target);
  } else {
    expect(base.name).toBe(target.name);
    expect(base instanceof target).toBeTruthy();
  }

  expect(base.preconditions).toHaveLength(properties.length);
  expect(base.effects).toHaveLength(effects.length);

  properties.forEach(([id, value]) => {
    const actual = base.getPrecondition(id)?.value();

    if (actual !== value) {
      throw new Error(`Action '${base.name}' precondition '${id}' is wrong. Expected '${value}', got '${actual}'.`);
    }
  });

  effects.forEach(([id, value]) => {
    const actual = base.getEffect(id)?.value();

    if (actual !== value) {
      throw new Error(`Action '${base.name}' effect '${id}' is wrong. Expected '${value}', got '${actual}'.`);
    }
  });
}
