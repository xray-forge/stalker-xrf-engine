import { LTX_INCLUDE } from "#/utils";

export const config = {
  [LTX_INCLUDE]: [
    "m_flesh.ltx",
    "m_bloodsucker.ltx",
    "m_dog.ltx",
    "M_boar.ltx",
    "m_pseudodog.ltx",
    "M_giant.ltx",
    "M_controller.ltx",
    "m_poltergeist.ltx",
    "m_snork.ltx",
    "m_crow.ltx",
    "m_tushkano.ltx",
    "m_phantom.ltx",
    "m_chimera.ltx",
    "m_burer.ltx",
  ],
  monsters_common: {
    corpse_remove_game_time_interval: 65_535,
    stay_after_death_time_interval: 65_535,
    script_move_min_offset_from_leader: 3,
    script_move_max_offset_from_leader: 8,
  },
};
