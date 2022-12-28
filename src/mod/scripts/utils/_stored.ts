/**
 -- ������� stalker � �������� ����� patrol_path(path_point)
 --[[
 function exports.stalker_go_to_waypoint(stalker, patrol_path, path_point)
 if stalker:animation_count() > 0 then
 stalker:clear_animations()
 end
 if stalker:level_vertex_id() == patrol_path:level_vertex_id(path_point) then
 return
 end
 stalker:set_dest_level_vertex_id(patrol_path:level_vertex_id(path_point))
 stalker:set_movement_type(move.run)
 stalker:set_body_state(move.standing)
 stalker:set_sight(look.path_dir, nil, 0)
 stalker:set_path_type(game_object.level_path)
 stalker:set_mental_state(anim.danger)
 stalker:set_detail_path_type(move.line)
 end
 --]]

 --[[
 function exports.stalker_look_at_waypoint(stalker, patrol_path, path_point)
 local look_pt = this.vector_copy_by_val(patrol_path:point(path_point)):sub(stalker:position())
 stalker:set_sight(look.direction, look_pt, 0)
 end
 --]]

 --[[

 --]]

 --[[
 function exports.stalker_look_at_stalker_angle(stalker, whom, angle)
 --stalker - killer
 --whom - killed :)
 local look_pt = this.vector_copy_by_val(whom:position()):sub(stalker:position())
 stalker:set_sight (look.direction, vector_rotate_y (look_pt, angle), 0)
 end
 --]]

 --[[
 function exports.stalker_look_firepoint_angle(stalker, whom, angle)
 --stalker - killer
 --whom - killed :)
 local look_pt = this.vector_copy_by_val(whom:position()):sub(stalker:position())
 stalker:set_sight (look.fire_point, vector_rotate_y (look_pt, angle), 0)
 end
 --]]

 */
