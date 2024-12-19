import { describe, expect, it } from "@jest/globals";

import { simulationActivities } from "@/engine/core/managers/simulation/activity";
import { TSimulationActivityPrecondition } from "@/engine/core/managers/simulation/types";
import { Squad } from "@/engine/core/objects/squad";
import { TCommunity } from "@/engine/lib/constants/communities";
import { MockSquad } from "@/fixtures/engine";

describe("faction activities preconditions", () => {
  it("activities should be nulls or preconditions descriptors", () => {
    const squad: Squad = MockSquad.mock();
    const target: Squad = MockSquad.mock();

    // Verify internal structure.
    // Verify usage of pure checkers without throwing errors.
    for (const [, activity] of simulationActivities) {
      for (const condition of Object.values(activity)) {
        if (condition) {
          if (typeof condition === "function") {
            expect(typeof condition(squad, target)).toBe("boolean");
          } else {
            for (const nested of Object.values(condition as Record<TCommunity, TSimulationActivityPrecondition>)) {
              if (nested) {
                expect(typeof nested).toBe("function");
                expect(typeof nested(squad, target)).toBe("boolean");
              } else {
                expect(nested).toBeNull();
              }
            }
          }
        } else {
          expect(condition).toBeNull();
        }
      }
    }
  });
});
