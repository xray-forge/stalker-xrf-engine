import { LTX_ROOT, newFloatField, newIntegerField, newStringField } from "#/utils";

import { captions } from "@/engine/lib/constants/captions/captions";
import { ON } from "@/engine/lib/constants/words";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  [LTX_ROOT]: {
    ph_iterations: newIntegerField(18, { isBinding: true }),
    r1_dlights_clip: newIntegerField(50, { isBinding: true }),
    r1_glows_per_frame: newIntegerField(16, { isBinding: true }),
    r2_detail_bump: newStringField(ON, { isBinding: true }),
    r2_dof_enable: newStringField(ON, { isBinding: true }),
    r2_ls_squality: newFloatField(1, { isBinding: true }),
    r2_slight_fade: newFloatField(0.5, { isBinding: true }),
    r2_soft_particles: newStringField(ON, { isBinding: true }),
    r2_soft_water: newStringField(ON, { isBinding: true }),
    r2_ssao: newStringField(captions.st_opt_high, { isBinding: true }),
    r2_steep_parallax: newStringField(ON, { isBinding: true }),
    r2_sun_quality: newStringField(captions.st_opt_high, { isBinding: true }),
    r2_sun_shafts: newStringField(captions.st_opt_high, { isBinding: true }),
    r2_volumetric_lights: newStringField(ON, { isBinding: true }),
    r3_dynamic_wet_surfaces: newStringField(ON, { isBinding: true }),
    r3_volumetric_smoke: newStringField(ON, { isBinding: true }),
    r__detail_density: newFloatField(0.2, { isBinding: true }),
    r__geometry_lod: newFloatField(1, { isBinding: true }),
    r__supersample: newIntegerField(1, { isBinding: true }),
    r__tf_aniso: newIntegerField(16, { isBinding: true }),
    r__wallmark_ttl: newIntegerField(60, { isBinding: true }),
    rs_skeleton_update: newIntegerField(32, { isBinding: true }),
    rs_vis_distance: newFloatField(1, { isBinding: true }),
    snd_cache_size: newIntegerField(32, { isBinding: true }),
    snd_targets: newIntegerField(32, { isBinding: true }),
    texture_lod: newIntegerField(0, { isBinding: true }),
  },
};
