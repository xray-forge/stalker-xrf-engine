import { describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { DROP_MANAGER_CONFIG_LTX } from "@/engine/core/managers/drop/DropConfig";
import {
  readIniDropByCommunity,
  readIniDropCountByLevel,
  readIniDropDependentItems,
} from "@/engine/core/managers/drop/utils/drop_init";
import { communities } from "@/engine/lib/constants/communities";
import { AnyObject, TName } from "@/engine/lib/types";

describe("drop_init utils", () => {
  it("readIniDropByCommunity should correctly read data", () => {
    expect(readIniDropByCommunity(DROP_MANAGER_CONFIG_LTX)).toEqualLuaTables({
      ...Object.keys(communities).reduce(
        (acc, it) => {
          acc[it] = {};

          return acc;
        },
        {} as Record<TName, AnyObject>
      ),
      stalker: {
        af_cristall: 0,
        ammo_9x18_fmj: 100,
        ammo_9x18_pmm: 100,
        bandage: 25,
        bread: 10,
      },
      zombied: {
        af_cristall: 0,
        ammo_9x18_fmj: 100,
        medkit: 20,
        medkit_army: 5,
      },
    });
  });

  it("readIniDropDependentItems should correctly read data", () => {
    expect(readIniDropDependentItems(DROP_MANAGER_CONFIG_LTX)).toEqualLuaTables({
      "ammo_11.43x23_fmj": {
        wpn_colt1911: true,
        wpn_desert_eagle: true,
        wpn_sig220: true,
        wpn_usp: true,
      },
      ammo_12x70_buck: {
        wpn_bm16: true,
        wpn_protecta: true,
        wpn_spas12: true,
        wpn_toz34: true,
        wpn_wincheaster1300: true,
      },
      ammo_9x18_fmj: {
        wpn_fort: true,
        wpn_pb: true,
        wpn_pm: true,
      },
      ammo_9x19_fmj: {
        wpn_beretta: true,
        wpn_hpsa: true,
        wpn_mp5: true,
        wpn_walther: true,
      },
    });
  });

  it("readIniDropCountByLevel should correctly read data", () => {
    expect(level.name()).toBe("zaton");
    expect(level.get_game_difficulty()).toBe(3);
    expect(readIniDropCountByLevel(DROP_MANAGER_CONFIG_LTX)).toEqualLuaTables({
      af_cristall: {
        max: 84,
        min: 84,
      },
      ammo_9x18_fmj: {
        max: 264,
        min: 264,
      },
    });
  });
});
