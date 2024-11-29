const onlineOfflineGroup = {
  GroupControlSection: "spawn_group",
  class: "ON_OFF_S",
};

export const mockSquadDescription = {
  online_offline_group: {
    ...onlineOfflineGroup,
  },
  test_squad: {
    ...onlineOfflineGroup,
    faction: "stalker",
    npc: "test_npc_1, test_npc_2",
  },
  simulation_stalker: {
    ...onlineOfflineGroup,
    faction: "stalker",
    npc_random: "sim_default_stalker_0, sim_default_stalker_1, sim_default_stalker_2, sim_default_stalker_3",
    npc_in_squad: "2, 3",
  },
  simulation_stalker_squad: {
    ...onlineOfflineGroup,
    faction: "stalker",
    npc_random: "sim_default_stalker_0, sim_default_stalker_1, sim_default_stalker_2, sim_default_stalker_3",
    npc_in_squad: "2, 3",
  },
  stalker_sim_squad_novice: {
    ...onlineOfflineGroup,
    faction: "stalker",
    npc_random: "sim_default_stalker_0, sim_default_stalker_1, sim_default_stalker_2",
    npc_in_squad: "2, 3",
  },
  simulation_bandit: {
    ...onlineOfflineGroup,
    faction: "bandit",
    npc_random: "sim_default_bandit_0, sim_default_bandit_1, sim_default_bandit_2, sim_default_bandit_3",
    npc_in_squad: "2, 3",
  },
  simulation_duty_1: {
    ...onlineOfflineGroup,
    faction: "dolg",
    npc_random: "sim_default_duty_0, sim_default_duty_1, sim_default_duty_1, sim_default_duty_2",
    npc_in_squad: "2, 3",
  },
  jup_a10_bandit_squad: {
    ...onlineOfflineGroup,
    faction: "bandit",
    npc: "sim_default_bandit_3, sim_default_bandit_2, sim_default_bandit_2",
    story_id: "jup_a10_bandit_squad",
  },
};
