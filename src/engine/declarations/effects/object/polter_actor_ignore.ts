import { GameObject } from "xray16/alias";
import { extern, TRUE, TStringifiedBoolean } from "xray16/lib";

/**
 * Toggle poltergeist object ignoring of actor.
 */
extern("xr_effects.polter_actor_ignore", (_: GameObject, object: GameObject, [ignore]: [TStringifiedBoolean]): void => {
  object.poltergeist_set_actor_ignore(ignore === TRUE);
});
