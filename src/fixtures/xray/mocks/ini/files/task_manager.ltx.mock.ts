export const mockTaskManager = {
  hide_from_surge: {
    icon: "ui_inGame2_Vibros",
    prior: 200,
    title_functor: "surge_task_title",
    descr_functor: "surge_task_descr",
    target_functor: "surge_task_target",
    condlist_0: "{=surge_complete()} complete",
    condlist_1: "{!actor_alive()} fail",
  },
  zat_b28_heli_3_crash: {
    icon: "ui_inGame2_Skat_3",
    prior: 103,
    storyline: true,
    title: "zat_b28_heli_3_crash_name",
    descr: "zat_b28_heli_3_crash_text",
    target: "zat_b28_heli_3",
    condlist_0: "{+zat_b28_heli_3_searched} complete",
  },
};
