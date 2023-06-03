import { LTX_ROOT, newFloatField, newIntegerField, newStringField } from "#/utils";

import { captions } from "@/engine/lib/constants/captions/captions";
import { OFF, ON } from "@/engine/lib/constants/words";

/**
 * todo;
 */
export const config = {
  [LTX_ROOT]: {
    ph_iterations: newIntegerField(18, { isBinding: true }),
    r1_dlights_clip: newIntegerField(20, { isBinding: true }),
    r1_glows_per_frame: newIntegerField(16, { isBinding: true }),
    r2_detail_bump: newStringField(OFF, { isBinding: true }),
    r2_dof_enable: newStringField(OFF, { isBinding: true }),
    r2_ls_squality: newFloatField(0.5, { isBinding: true }),
    r2_slight_fade: newFloatField(0.5, { isBinding: true }),
    r2_soft_particles: newStringField(OFF, { isBinding: true }),
    r2_soft_water: newStringField(OFF, { isBinding: true }),
    r2_ssao: newStringField(captions.st_opt_off, { isBinding: true }),
    r2_steep_parallax: newStringField(OFF, { isBinding: true }),
    r2_sun_quality: newStringField(captions.st_opt_low, { isBinding: true }),
    r2_sun_shafts: newStringField(captions.st_opt_off, { isBinding: true }),
    r2_volumetric_lights: newStringField(OFF, { isBinding: true }),
    r3_dynamic_wet_surfaces: newStringField(ON, { isBinding: true }),
    r3_volumetric_smoke: newStringField(OFF, { isBinding: true }),
    r__detail_density: newFloatField(0.7, { isBinding: true }),
    r__geometry_lod: newFloatField(0.5, { isBinding: true }),
    r__supersample: newIntegerField(1, { isBinding: true }),
    r__tf_aniso: newIntegerField(1, { isBinding: true }),
    r__wallmark_ttl: newIntegerField(20, { isBinding: true }),
    rs_skeleton_update: newIntegerField(32, { isBinding: true }),
    rs_vis_distance: newFloatField(0.5, { isBinding: true }),
    snd_cache_size: newIntegerField(16, { isBinding: true }),
    snd_targets: newIntegerField(16, { isBinding: true }),
    texture_lod: newIntegerField(3, { isBinding: true }),
  },
};
