/**
 * Squad action type within alife simulation.
 */
export enum ESquadActionType {
  STAY_ON_TARGET = "stay_on_target",
  REACH_TARGET = "reach_target",
}

/**
 * Generic squad action interface.
 */
export interface ISquadAction {
  /**
   * Action type.
   */
  type: ESquadActionType;
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
