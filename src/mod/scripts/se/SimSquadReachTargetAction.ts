import { alife, XR_LuaBindBase } from "xray16";

import type { ISimSquad } from "@/mod/scripts/se/SimSquad";

export interface ISimSquadReachTargetAction extends XR_LuaBindBase {
  name: string;
  board: any;
  squad_id: number;

  finalize(): void;
  save(): void;
  load(): void;
  update(isUnderSimulation: boolean): boolean;
  make(isUnderSimulation: boolean): void;
}

export const SimSquadReachTargetAction: ISimSquadReachTargetAction = declare_xr_class(
  "SimSquadReachTargetAction",
  null,
  {
    __init(squad: ISimSquad): void {
      this.name = "reach_target";
      this.board = squad.board;
      this.squad_id = squad.id;
    },
    finalize(): void {},
    save(): void {},
    load(): void {},
    update(isUnderSimulation): boolean {
      const squad = alife().object<ISimSquad>(this.squad_id)!;
      let squad_target = get_global("simulation_objects").get_sim_obj_registry().objects[squad.assigned_target_id];

      if (!isUnderSimulation) {
        squad_target = alife().object(squad.assigned_target_id);
      }

      if (squad_target === null) {
        squad.clear_assigned_target();

        return true;
      }

      if (squad_target.am_i_reached(squad)) {
        squad_target.on_after_reach(squad);

        return true;
      }

      return false;
    },
    make(isUnderSimulation: boolean): void {
      const squad = alife().object<ISimSquad>(this.squad_id)!;
      let squad_target = get_global("simulation_objects").get_sim_obj_registry().objects[squad.assigned_target_id];

      if (!isUnderSimulation) {
        squad_target = alife().object(squad.assigned_target_id);
      }

      if (squad_target) {
        squad_target.on_reach_target(squad);
      }

      for (const k of squad.squad_members()) {
        if (k.object !== null) {
          this.board.setup_squad_and_group(k.object);
        }
      }
    }
  } as ISimSquadReachTargetAction
);
