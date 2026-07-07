export const mockTradeGeneric = {
  trader: {
    buy_condition: "generic_buy",
    sell_condition: "generic_sell",
    buy_supplies: "{+tier4} tier4, {+tier3} supplies_tier_3, {+tier2} tier2, tier1",
    discounts: "{+first} low_discounts, discounts_section",
  },
  discounts_section: {
    sell: 0.5,
    buy: 0.3,
  },
  buy_item_condition_factor: 0.7,
  generic_buy: {},
  generic_sell: {},
};
