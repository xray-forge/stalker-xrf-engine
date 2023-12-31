const stalker = {
  class: "AI_STL_S",
};

export const mockSpawnSections = {
  default_duty: {
    ...stalker,
    character_profile: "default_dolg",
  },
  sim_default_monolith_1: {
    ...stalker,
    character_profile: "sim_default_monolith_1",
    community: "monolith",
    spec_rank: "regular",
  },
  sim_default_freedom_3: {
    ...stalker,
    character_profile: "sim_default_freedom_3",
    community: "freedom",
    spec_rank: "veteran",
  },
};
