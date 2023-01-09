import { action_base, anim, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActMentalFree extends XR_action_base {
  st: StateManager;
}

export const StateManagerActMentalFree: IStateManagerActMentalFree = declare_xr_class(
  "StateManagerActMentalFree",
  action_base,
  {
    __init(name: string, st: StateManager) {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);
      // --    printf("BEFORE")
      // --    local sight_type = this.object:sight_params()
      // --    if sight_type.m_object ~= nil then
      // --        printf("@@@sight_obj %s", sight_type.m_object:id())
      // --    end
      // --    printf("@@@sight_vest %s %s %s", sight_type.m_vector.x, sight_type.m_vector.y, sight_type.m_vector.z)
      // --    printf("@@@sight_type %s", tostring(sight_type.m_sight_type))
      this.object.set_mental_state(anim.free);

      //  --    printf("AFTER")
      // const sight_type = this.object.sight_params();

      // if (sight_type.m_object !== null) {
      // --        printf("@@@sight_obj %s", sight_type.m_object:id())
      // }
      // --    printf("@@@sight_vest %s %s %s", sight_type.m_vector.x, sight_type.m_vector.y, sight_type.m_vector.z)
      // --    printf("@@@sight_type %s", tostring(sight_type.m_sight_type))
    },
    execute(): void {
      action_base.execute(this);
      this.object.set_mental_state(anim.free);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActMentalFree
);
