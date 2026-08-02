import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Check if actor has active detector of provided section on belt.
 *
 * Where:
 * - section - detector section to check.
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: GameObject, _: GameObject, [section]: [Nillable<TSection>]): boolean => {
    if (!section) {
      abort("Wrong parameters in condition 'actor_active_detector', detector section is expected.");
    }

    const detector: Nillable<GameObject> = actor.active_detector();

    return $isNotNil(detector) && detector.section() === section;
  }
);
