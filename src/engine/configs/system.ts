import { LTX_INCLUDE } from "#/utils";

export const config = {
  // ;"weathers\\environment.ltx"
  [LTX_INCLUDE]: [
    "defines.ltx",
    "prefetch\\prefetch.ltx",

    "creatures\\monsters.ltx",
    "creatures\\stalkers.ltx",
    "weapons\\weapons.ltx",
    "misc\\inventory_upgrades.ltx",
    "misc\\items.ltx",

    "creatures\\actor.ltx",
    "zones\\zones.ltx",
    "misc\\postprocess.ltx",

    "misc\\outfit.ltx",
    "misc\\achievements.ltx",
    "misc\\artefacts.ltx",
    "misc\\devices.ltx",
    "misc\\radiation_counter.ltx",
    "misc\\quest_items.ltx",
    "models\\dynamic_objects.ltx",
    "misc\\m_online_offline_group.ltx",
    "misc\\squad_descr.ltx",

    "misc\\effectors.ltx",
    "creatures\\helicopter.ltx",
    "external.ltx",

    "creatures\\game_relations.ltx",

    "mp\\mp_actor.ltx",
    "mp\\team_logo.ltx",
    "mp\\weapons_mp\\ammo_mp.ltx",
    "mp\\weapons_mp\\weapons_mp.ltx",
    "mp\\weapons_mp\\outfit_mp.ltx",
    "mp\\weapons_mp\\items_mp.ltx",

    // ;Game types
    "mp\\SoundMessages\\mp_snd_messages.ltx",
    "mp\\SoundMessages\\ahunt_snd_messages.ltx",
    "mp\\SoundMessages\\cta_snd_messages.ltx",
    "mp\\SoundMessages\\dm_snd_messages.ltx",
    "mp\\SoundMessages\\tdm_snd_messages.ltx",
    "mp\\private_defines.ltx",
    "mp\\deathmatch_game.ltx",
    "mp\\teamdeathmatch_game.ltx",
    "mp\\artefacthunt_game.ltx",
    "mp\\capturetheartefact_game.ltx",
    "mp\\anticheat_active_params.ltx",

    "evaluation.ltx",
    "fonts.ltx",

    "alife.ltx",
    // ; SIMULATION
    "misc\\simulation.ltx",

    // ; Respawns
    "creatures\\spawn_sections.ltx",

    // ; Extra Content
    "extracontent.ltx",
    "localization.ltx",
    "smart_cover.ltx",

    "base.ltx",
  ],
};
