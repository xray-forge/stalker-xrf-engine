import { newStringField } from "#/utils";

export const IS_LTX: boolean = true;

/**
 * todo;
 */
export const config = {
  extracontent_packs: {
    extracontent_pack_1: newStringField("BonusPack1"),
    extracontent_pack_2: newStringField("BonusPack2"),
  },
  extracontent_pack_1: [
    newStringField("stalker_killer_mask_us"),
    newStringField("stalker_killer_mask_uk"),
    newStringField("mp_pool"),
  ],
  extracontent_pack_2: [
    newStringField("stalker_killer_mask_de"),
    newStringField("stalker_killer_mask_fr"),
    newStringField("mp_darkvalley"),
  ],
};
