import { ParticlesObject, SoundObject, Vector } from "xray16/alias";
import { LuaArray, Nillable, TStringId } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger("quests");

export const questsState: {
  jupB219Position: Nillable<Vector>;
  jupB219LVId: Nillable<number>;
  jupB219GVId: Nillable<number>;
  particlesList: Nillable<LuaArray<{ particle: ParticlesObject; sound: SoundObject }>>;
} = {
  jupB219Position: null,
  jupB219LVId: null,
  jupB219GVId: null,
  particlesList: null,
};

export const materialsTable: LuaArray<TStringId> = $fromArray([
  "jup_b200_material_1",
  "jup_b200_material_2",
  "jup_b200_material_3",
  "jup_b200_material_4",
  "jup_b200_material_5",
  "jup_b200_material_6",
  "jup_b200_material_7",
  "jup_b200_material_8",
  "jup_b200_material_9",
]);
