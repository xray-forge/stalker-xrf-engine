import { LTX_EXTEND } from "#/utils";

export const config = {
  zone_base: {
    idle_light_volumetric: false,
    idle_light_shadow: true,
    effective_radius: 1,
    pick_dof_effector: false,
    idle_light_r1: true,
    script_binding: "bind.anomalyField",
    // ;bolt_entrance_particles	: "anomaly2\\anomaly_entrance"
  },
  zone_base_noshadow: {
    [LTX_EXTEND]: "zone_base",
    idle_light_shadow: false,
    idle_light_r1: true,
  },
};
