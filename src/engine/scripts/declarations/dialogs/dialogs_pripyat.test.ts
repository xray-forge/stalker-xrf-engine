import { beforeAll, describe, it } from "@jest/globals";
import { TName } from "xray16/lib";

import { checkNestedBinding } from "@/fixtures/engine";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs_pripyat", name);
}

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_pripyat");
});

describe("pri_b301_zulus_reward", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b301_zulus_reward");
  });
});

describe("pri_a17_reward", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_a17_reward");
  });
});

describe("actor_has_pri_a17_gauss_rifle", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_has_pri_a17_gauss_rifle");
  });
});

describe("actor_hasnt_pri_a17_gauss_rifle", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_hasnt_pri_a17_gauss_rifle");
  });
});

describe("transfer_artifact_af_baloon", () => {
  it("should be registered", () => {
    checkDialogsBinding("transfer_artifact_af_baloon");
  });
});

describe("pay_cost_to_guide_to_zaton", () => {
  it("should be registered", () => {
    checkDialogsBinding("pay_cost_to_guide_to_zaton");
  });
});

describe("jup_b43_actor_has_10000_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_b43_actor_has_10000_money");
  });
});

describe("jup_b43_actor_do_not_has_10000_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_b43_actor_do_not_has_10000_money");
  });
});

describe("pay_cost_to_guide_to_jupiter", () => {
  it("should be registered", () => {
    checkDialogsBinding("pay_cost_to_guide_to_jupiter");
  });
});

describe("jup_b43_actor_has_7000_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_b43_actor_has_7000_money");
  });
});

describe("jup_b43_actor_do_not_has_7000_money", () => {
  it("should be registered", () => {
    checkDialogsBinding("jup_b43_actor_do_not_has_7000_money");
  });
});

describe("pri_b35_transfer_svd", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b35_transfer_svd");
  });
});

describe("pri_b35_give_actor_reward", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b35_give_actor_reward");
  });
});

describe("pri_a25_medic_give_kit", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_a25_medic_give_kit");
  });
});

describe("pri_a22_army_signaller_supply", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_a22_army_signaller_supply");
  });
});

describe("pri_a22_give_actor_outfit", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_a22_give_actor_outfit");
  });
});

describe("pri_b305_actor_has_strelok_notes", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_notes");
  });
});

describe("pri_b305_actor_has_strelok_note_1", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_1");
  });
});

describe("pri_b305_actor_has_strelok_note_2", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_2");
  });
});

describe("pri_b305_actor_has_strelok_note_3", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_3");
  });
});

describe("pri_b305_actor_has_strelok_note_12", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_12");
  });
});

describe("pri_b305_actor_has_strelok_note_13", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_13");
  });
});

describe("pri_b305_actor_has_strelok_note_23", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_23");
  });
});

describe("pri_b305_actor_has_strelok_note_all", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_actor_has_strelok_note_all");
  });
});

describe("pri_b305_sell_strelok_notes", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_b305_sell_strelok_notes");
  });
});

describe("pri_a17_sokolov_is_not_at_base", () => {
  it("should be registered", () => {
    checkDialogsBinding("pri_a17_sokolov_is_not_at_base");
  });
});
