import {
  newBooleanField,
  newEmptyField,
  newFloatField,
  newFloatsField,
  newIntegerField,
  newIntegersField,
  newStringField,
} from "#/utils";

import { quoted } from "@/mod/lib/utils/string";

/**
 * todo;
 */
export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  smart_cover: {
    GroupControlSection: newStringField("spawn_group_zone"),
    $spawn: newStringField(quoted("ai\\smart_cover")),
    $def_sphere: newIntegerField(2),
    $_render_if_selected: newEmptyField(),
    class: newStringField("SMRT_C_S"),
    is_combat_cover: newIntegerField(1),
    shape_transp_color: newIntegersField([0, 200, 200, 60], { comment: "0x1800FF00" }),
    shape_edge_color: newIntegersField([32, 32, 32, 255], { comment: "0xFF202020" }),
    enter_min_enemy_distance: newFloatField(15.0),
    exit_min_enemy_distance: newFloatField(10.0),
    can_fire: newBooleanField(false),
    script_binding: newStringField("bind.list.bindSmartCover"),
  },
  smart_covers_animation_offsets: {
    loophole_1_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_1_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_1_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_2_no_look_idle_0: newFloatsField([70.0, 0.0]),
    loophole_2_no_look_shoot_0: newFloatsField([70.0, 0.0]),
    loophole_2_no_look_shoot_1: newFloatsField([70.0, 0.0]),
    loophole_3_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_3_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_3_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_4_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_4_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_4_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_5_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_5_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_5_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_6_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_6_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_6_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_7_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_7_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_7_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_8_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_8_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_8_no_look_shoot_1: newFloatsField([45.0, 0.0]),
    loophole_9_no_look_idle_0: newFloatsField([45.0, 0.0]),
    loophole_9_no_look_shoot_0: newFloatsField([45.0, 0.0]),
    loophole_9_no_look_shoot_1: newFloatsField([45.0, 0.0]),
  },
} as const;
