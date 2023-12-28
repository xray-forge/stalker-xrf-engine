import { describe, expect, it } from "@jest/globals";

import { DIALOG_MANAGER_CONFIG_LTX } from "@/engine/core/managers/dialogs/DialogConfig";
import { readIniGenericDialogs } from "@/engine/core/managers/dialogs/utils/dialog_read";
import { TNumberId } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("readIniGenericDialogs util", () => {
  it("should read generic dialogs", () => {
    let id: TNumberId = 1;

    expect(readIniGenericDialogs(DIALOG_MANAGER_CONFIG_LTX, () => ++id)).toEqualLuaTables({
      anomalies: {
        "6": {
          actor_community: "not_set",
          id: "6",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_1",
          npc_community: ["stalker"],
          once: "always",
          smart: "zat_b14_smart_terrain",
          wounded: "false",
        },
        "7": {
          actor_community: "not_set",
          id: "7",
          info: [],
          level: ["all"],
          name: "dm_anomalies_2",
          npc_community: ["stalker"],
          once: "always",
          smart: "",
          wounded: "false",
        },
        "8": {
          actor_community: "not_set",
          id: "8",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_3",
          npc_community: ["stalker"],
          once: "always",
          smart: "zat_b101",
          wounded: "false",
        },
        "9": {
          actor_community: "not_set",
          id: "9",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_4",
          npc_community: ["stalker"],
          once: "always",
          smart: "zat_b100",
          wounded: "false",
        },
      },
      hello: {
        "14": {
          actor_community: "not_set",
          id: "14",
          info: [],
          level: ["all"],
          name: "dm_help_0",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: true,
        },
        "15": {
          actor_community: "not_set",
          id: "15",
          info: [],
          level: ["all"],
          name: "dm_help_1",
          npc_community: ["bandit"],
          once: "always",
          smart: null,
          wounded: true,
        },
        "16": {
          actor_community: "not_set",
          id: "16",
          info: [],
          level: ["all"],
          name: "dm_hello_1",
          npc_community: ["bandit"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "17": {
          actor_community: "not_set",
          id: "17",
          info: [],
          level: ["all"],
          name: "dm_hello_2",
          npc_community: ["freedom"],
          once: "always",
          smart: null,
          wounded: "false",
        },
      },
      information: {
        "10": {
          actor_community: "not_set",
          id: "10",
          info: [
            {
              name: "zat_b14_take_item",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_information_1",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "11": {
          actor_community: "not_set",
          id: "11",
          info: [
            {
              name: "zat_b38_disappearance_stalkers_get_out_from_den_of_the_bloodsucker_give",
              required: true,
            },
            {
              name: "zat_b38_disappearance_stalkers_tell_barmen_about_medic_give",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_information_2",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "12": {
          actor_community: "not_set",
          id: "12",
          info: [
            {
              name: "zat_b38_disappearance_stalkers_tell_barmen_about_medic_give",
              required: true,
            },
          ],
          level: ["zaton"],
          name: "dm_information_3",
          npc_community: ["bandit"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "13": {
          actor_community: "not_set",
          id: "13",
          info: [
            {
              name: "zat_b108_actor_damaged_chimera",
              required: true,
            },
            {
              name: "zat_b106_chimera_dead",
              required: true,
            },
          ],
          level: ["zaton"],
          name: "dm_information_4",
          npc_community: ["bandit"],
          once: "always",
          smart: null,
          wounded: "false",
        },
      },
      job: {
        "2": {
          actor_community: "not_set",
          id: "2",
          info: [
            {
              name: "zat_b38_disappearance_stalkers_get_out_from_den_of_the_bloodsucker_give",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_1",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "3": {
          actor_community: "not_set",
          id: "3",
          info: [
            {
              name: "zat_b106_gonta_accept_actor",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_2",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "4": {
          actor_community: "not_set",
          id: "4",
          info: [
            {
              name: "zat_b7_bandit_boss_sultan_intro",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_3",
          npc_community: ["bandit"],
          once: "always",
          smart: null,
          wounded: "false",
        },
        "5": {
          actor_community: "not_set",
          id: "5",
          info: [
            {
              name: "zat_a2_stalker_barmen_setup",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_4",
          npc_community: ["stalker"],
          once: "always",
          smart: null,
          wounded: "false",
        },
      },
      place: {},
    });
  });

  it("correctly read empty dialogs lists", () => {
    expect(readIniGenericDialogs(MockIniFile.mock("test.ltx", {}), () => 1)).toEqualLuaTables({
      anomalies: {},
      hello: {},
      information: {},
      job: {},
      place: {},
    });
  });

  it("should fail on wrong data", () => {
    expect(() => {
      readIniGenericDialogs(
        MockIniFile.mock("test.ltx", {
          list: ["corrupted"],
          corrupted: {},
        }),
        () => 1
      );
    }).toThrow("Dialog manager error. Unknown category in 'corrupted' provided.");
  });
});
