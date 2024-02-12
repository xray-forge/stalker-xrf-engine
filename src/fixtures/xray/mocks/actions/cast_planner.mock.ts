import type { ActionBase, ActionPlanner, AnyObject } from "@/engine/lib/types";
import { MockActionPlanner } from "@/fixtures/xray/mocks/actions/action_planner.mock";

/**
 * Mock cast planner behaviour from the game engine.
 * Create lazy hidden planner and use it as alternative when casting action value.
 */
export function mockCastPlanner(action: ActionBase): ActionPlanner {
  const actionContainer: AnyObject = action;

  if (actionContainer.planner) {
    return actionContainer.planner;
  } else {
    const planner: ActionPlanner = MockActionPlanner.mock();

    actionContainer.planner = planner;

    return planner;
  }
}
