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
          actorCommunity: "not_set",
          id: "6",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_1",
          npcCommunity: ["stalker"],
          once: "always",
          smart: "zat_b14_smart_terrain",
          wounded: false,
        },
        "7": {
          actorCommunity: "not_set",
          id: "7",
          info: [],
          level: ["all"],
          name: "dm_anomalies_2",
          npcCommunity: ["stalker"],
          once: "always",
          smart: "",
          wounded: false,
        },
        "8": {
          actorCommunity: "not_set",
          id: "8",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_3",
          npcCommunity: ["stalker"],
          once: "always",
          smart: "zat_b101",
          wounded: false,
        },
        "9": {
          actorCommunity: "not_set",
          id: "9",
          info: [],
          level: ["zaton"],
          name: "dm_anomalies_4",
          npcCommunity: ["stalker"],
          once: "always",
          smart: "zat_b100",
          wounded: false,
        },
      },
      hello: {
        "14": {
          actorCommunity: "not_set",
          id: "14",
          info: [],
          level: ["all"],
          name: "dm_help_0",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: true,
        },
        "15": {
          actorCommunity: "not_set",
          id: "15",
          info: [],
          level: ["all"],
          name: "dm_help_1",
          npcCommunity: ["bandit"],
          once: "always",
          smart: null,
          wounded: true,
        },
        "16": {
          actorCommunity: "not_set",
          id: "16",
          info: [],
          level: ["all"],
          name: "dm_hello_0",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "17": {
          actorCommunity: "not_set",
          id: "17",
          info: [],
          level: ["all"],
          name: "dm_hello_1",
          npcCommunity: ["bandit"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "18": {
          actorCommunity: "not_set",
          id: "18",
          info: [],
          level: ["all"],
          name: "dm_hello_2",
          npcCommunity: ["freedom"],
          once: "always",
          smart: null,
          wounded: false,
        },
      },
      information: {
        "10": {
          actorCommunity: "not_set",
          id: "10",
          info: [
            {
              name: "zat_b14_take_item",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_information_1",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "11": {
          actorCommunity: "not_set",
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
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "12": {
          actorCommunity: "not_set",
          id: "12",
          info: [
            {
              name: "zat_b38_disappearance_stalkers_tell_barmen_about_medic_give",
              required: true,
            },
          ],
          level: ["zaton"],
          name: "dm_information_3",
          npcCommunity: ["bandit"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "13": {
          actorCommunity: "not_set",
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
          npcCommunity: ["bandit"],
          once: "always",
          smart: null,
          wounded: false,
        },
      },
      job: {
        "2": {
          actorCommunity: "not_set",
          id: "2",
          info: [
            {
              name: "zat_b38_disappearance_stalkers_get_out_from_den_of_the_bloodsucker_give",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_1",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "3": {
          actorCommunity: "not_set",
          id: "3",
          info: [
            {
              name: "zat_b106_gonta_accept_actor",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_2",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "4": {
          actorCommunity: "not_set",
          id: "4",
          info: [
            {
              name: "zat_b7_bandit_boss_sultan_intro",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_3",
          npcCommunity: ["bandit"],
          once: "always",
          smart: null,
          wounded: false,
        },
        "5": {
          actorCommunity: "not_set",
          id: "5",
          info: [
            {
              name: "zat_a2_stalker_barmen_setup",
              required: false,
            },
          ],
          level: ["zaton"],
          name: "dm_job_4",
          npcCommunity: ["stalker"],
          once: "always",
          smart: null,
          wounded: false,
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

  it("correctly read minimalistic dialogs lists", () => {
    let id: TNumberId = 1;

    expect(
      readIniGenericDialogs(
        MockIniFile.mock("test.ltx", {
          list: ["a"],
          a: { category: "job" },
        }),
        () => ++id
      )
    ).toEqualLuaTables({
      anomalies: {},
      hello: {},
      information: {},
      job: {
        "2": {
          actorCommunity: "not_set",
          id: "2",
          info: [],
          level: "not_set",
          name: "a",
          npcCommunity: "not_set",
          once: "always",
          smart: null,
          wounded: false,
        },
      },
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
