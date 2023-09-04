import { TName } from "@/engine/lib/types";

/**
 * Generic squad action interface.
 */
export interface ISquadAction {
  /**
   * Action name.
   * Unique identifier of action type.
   */
  name: TName;
  /**
   * Initialize action.
   *
   * @param isUnderSimulation - is squad under simulation
   */
  initialize: (isUnderSimulation: boolean) => void;
  /**
   * Finalize and destroy everything related to the action.
   * Called when object drops action instance and finds something new.
   */
  finalize: () => void;
  /**
   * Perform generic update tick for action.
   *
   * @param isUnderSimulation - is squad under simulation
   * @returns whether action is finished
   */
  update: (isUnderSimulation: boolean) => boolean;
}
