import { Vector } from "xray16/alias";
import { Nillable } from "xray16/lib";

// todo: Move to input manager or effects state.
export const actorState: { actorPositionForRestore: Nillable<Vector> } = {
  actorPositionForRestore: null,
};
