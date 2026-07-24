import { beforeAll, describe, it } from "@jest/globals";
import { TName } from "xray16/lib";

import { checkNestedBinding } from "@/fixtures/engine";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs", name);
}

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_quest");
});

describe("quest_dialog_heli_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("quest_dialog_heli_precond");
  });
});

describe("quest_dialog_military_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("quest_dialog_military_precond");
  });
});

describe("quest_dialog_squad_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("quest_dialog_squad_precond");
  });
});

describe("quest_dialog_toolkits_precond", () => {
  it("should be registered", () => {
    checkDialogsBinding("quest_dialog_toolkits_precond");
  });
});

describe("monolith_leader_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("monolith_leader_is_alive");
  });
});

describe("monolith_leader_dead_or_hired", () => {
  it("should be registered", () => {
    checkDialogsBinding("monolith_leader_dead_or_hired");
  });
});

describe("monolith_leader_dead_or_dolg", () => {
  it("should be registered", () => {
    checkDialogsBinding("monolith_leader_dead_or_dolg");
  });
});

describe("squad_not_in_smart_b101", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b101");
  });
});

describe("squad_not_in_smart_b103", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b103");
  });
});

describe("squad_not_in_smart_b104", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b104");
  });
});

describe("squad_not_in_smart_b213", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b213");
  });
});

describe("squad_not_in_smart_b214", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b214");
  });
});

describe("squad_not_in_smart_b304", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b304");
  });
});

describe("squad_not_in_smart_b303", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b303");
  });
});

describe("squad_not_in_smart_b40", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b40");
  });
});

describe("squad_not_in_smart_b18", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b18");
  });
});

describe("squad_not_in_smart_b6", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b6");
  });
});

describe("squad_not_in_smart_b205", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b205");
  });
});

describe("squad_not_in_smart_b47", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b47");
  });
});

describe("squad_in_smart_zat_base", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_in_smart_zat_base");
  });
});

describe("squad_in_smart_jup_b25", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_in_smart_jup_b25");
  });
});

describe("spartak_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("spartak_is_alive");
  });
});

describe("tesak_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("tesak_is_alive");
  });
});

describe("gonta_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("gonta_is_alive");
  });
});

describe("mityay_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("mityay_is_alive");
  });
});

describe("dolg_can_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("dolg_can_work_for_sci");
  });
});

describe("dolg_can_not_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("dolg_can_not_work_for_sci");
  });
});

describe("freedom_can_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("freedom_can_work_for_sci");
  });
});

describe("freedom_can_not_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("freedom_can_not_work_for_sci");
  });
});

describe("monolith_leader_dead_or_freedom", () => {
  it("should be registered", () => {
    checkDialogsBinding("monolith_leader_dead_or_freedom");
  });
});

describe("medic_magic_potion", () => {
  it("should be registered", () => {
    checkDialogsBinding("medic_magic_potion");
  });
});

describe("actor_needs_bless", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_needs_bless");
  });
});

describe("actor_is_damn_healthy", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_is_damn_healthy");
  });
});

describe("leave_zone_save", () => {
  it("should be registered", () => {
    checkDialogsBinding("leave_zone_save");
  });
});

describe("save_uni_travel_zat_to_jup", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_zat_to_jup");
  });
});

describe("save_uni_travel_zat_to_pri", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_zat_to_pri");
  });
});

describe("save_uni_travel_jup_to_zat", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_jup_to_zat");
  });
});

describe("save_uni_travel_jup_to_pri", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_jup_to_pri");
  });
});

describe("save_uni_travel_pri_to_zat", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_pri_to_zat");
  });
});

describe("save_uni_travel_pri_to_jup", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_pri_to_jup");
  });
});

describe("save_jup_b218_travel_jup_to_pas", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b218_travel_jup_to_pas");
  });
});

describe("save_pri_a17_hospital_start", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_pri_a17_hospital_start");
  });
});

describe("save_jup_a10_gonna_return_debt", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_a10_gonna_return_debt");
  });
});

describe("save_jup_b6_arrived_to_fen", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b6_arrived_to_fen");
  });
});

describe("save_jup_b6_arrived_to_ash_heap", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b6_arrived_to_ash_heap");
  });
});

describe("save_jup_b19_arrived_to_kopachy", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b19_arrived_to_kopachy");
  });
});

describe("save_zat_b106_arrived_to_chimera_lair", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_zat_b106_arrived_to_chimera_lair");
  });
});

describe("save_zat_b5_met_with_others", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_zat_b5_met_with_others");
  });
});
