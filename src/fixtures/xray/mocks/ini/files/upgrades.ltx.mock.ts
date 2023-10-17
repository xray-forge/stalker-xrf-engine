export const mockUpgradesLtx = {
  up_sect_firsta_ak74u: {
    cost: "400",
    value: "+10",
    rpm: "+65 ;600",
  },
  up_sect_firstc_ak74u: {
    cost: "650",
    value: "+15",
    fire_dispersion_condition_factor: "-1 ;15",
  },
  up_sect_firstd_ak74u: {
    cost: "650",
    value: "-20",
    cam_dispersion: "-0.18 ;1.2",
  },
  up_sect_firste_ak74u: {
    cost: "900",
    value: "-30",
    cam_dispersion: "-0.27 ;0.5",
  },
  up_sect_secona_ak74u: {
    cost: "400",
    value: "-10",
    cam_dispersion: "-0.08 ;0.5",
  },
  up_sect_seconc_ak74u: {
    cost: "650",
    value: "+15",
    misfire_end_prob: "-0.011 ;0.03",
  },
  up_sect_secone_ak74u: {
    cost: "900",
    value: "-30",
    cam_dispersion_inc: "-0.12 ;0.5",
  },
  up_sect_seconf_ak74u: {
    cost: "900",
    value: "+25",
    PDM_disp_accel_factor: "-0.3 ;1.5",
  },
  up_sect_thirda_ak74u: {
    cost: "400",
    value: "-10",
    cam_dispersion_inc: "-0.03 ;0.5",
  },
  up_sect_thirdc_ak74u: {
    cost: "650",
    value: "+15",
    rpm: "+90 ;600",
  },
  up_sect_thirdd_ak74u: {
    cost: "650",
    value: "+15",
    misfire_end_prob: "-0.011 ;0.03",
  },
  up_sect_thirde_ak74u: {
    cost: "900",
    value: "+25",
    PDM_disp_vel_factor: "-0.3 ;1.5",
  },
  up_sect_fourta_ak74u: {
    cost: "400",
    value: "-10",
    cam_dispersion_inc: "-0.03 ;0.5",
  },
  up_sect_fourtc_ak74u: {
    cost: "650",
    value: "+15",
    rpm: "+90 ;600",
  },
  up_sect_fourte_ak74u: {
    cost: "900",
    value: "+25",
    rpm: "+125 ;600",
  },
  up_sect_fiftha_ak74u: {
    cost: "800",
    value: "+10",
    ammo_mag_size: "10",
  },
  up_firsta_ak74u: {
    scheme_index: "0, 0",
    known: "1",
    effects: "up_gr_firstcd_ak74u",
    section: "up_sect_firsta_ak74u",
    property: "prop_rpm",
  },
  up_firstc_ak74u: {
    scheme_index: "1, 0",
    known: "1",
    effects: "up_gr_firstef_ak74u",
    section: "up_sect_firstc_ak74u",
    property: "prop_reliability",
  },
  up_firstd_ak74u: {
    scheme_index: "1, 1",
    known: "1",
    effects: "up_gr_firstef_ak74u",
    section: "up_sect_firstd_ak74u",
    property: "prop_recoil",
  },
  up_firste_ak74u: {
    scheme_index: "2, 0",
    known: "1",
    section: "up_sect_firste_ak74u",
    property: "prop_recoil",
  },
  up_secona_ak74u: {
    scheme_index: "0, 1",
    known: "1",
    effects: "up_gr_seconcd_ak74u",
    section: "up_sect_secona_ak74u",
    property: "prop_recoil",
  },
  up_seconc_ak74u: {
    scheme_index: "1, 2",
    known: "1",
    effects: "up_gr_seconef_ak74u",
    section: "up_sect_seconc_ak74u",
    property: "prop_reliability",
  },
  up_secone_ak74u: {
    scheme_index: "2, 1",
    known: "1",
    section: "up_sect_secone_ak74u",
    property: "prop_recoil",
  },
  up_seconf_ak74u: {
    scheme_index: "2, 2",
    known: "1",
    section: "up_sect_seconf_ak74u",
    property: "prop_inertion",
  },
  up_thirda_ak74u: {
    scheme_index: "0, 2",
    known: "1",
    effects: "up_gr_thirdcd_ak74u",
    section: "up_sect_thirda_ak74u",
    property: "prop_recoil",
  },
  up_thirdc_ak74u: {
    scheme_index: "1, 3",
    known: "1",
    effects: "up_gr_thirdef_ak74u",
    section: "up_sect_thirdc_ak74u",
    property: "prop_rpm",
  },
  up_thirdd_ak74u: {
    scheme_index: "1, 4",
    known: "1",
    effects: "up_gr_thirdef_ak74u",
    section: "up_sect_thirdd_ak74u",
    property: "prop_reliability",
  },
  up_thirde_ak74u: {
    scheme_index: "2, 3",
    known: "1",
    section: "up_sect_thirde_ak74u",
    property: "prop_inertion",
  },
  up_fourta_ak74u: {
    scheme_index: "0, 3",
    known: "1",
    effects: "up_gr_fourtcd_ak74u",
    section: "up_sect_fourta_ak74u",
    property: "prop_recoil",
  },
  up_fourtc_ak74u: {
    scheme_index: "1, 5",
    known: "1",
    effects: "up_gr_fourtef_ak74u",
    section: "up_sect_fourtc_ak74u",
    property: "prop_rpm",
  },
  up_fourte_ak74u: {
    scheme_index: "2, 4",
    known: "1",
    section: "up_sect_fourte_ak74u",
    property: "prop_rpm",
  },
  up_fiftha_ak74u: {
    scheme_index: "0, 4",
    known: "1",
    section: "up_sect_fiftha_ak74u",
    property: "prop_ammo_size",
  },
  up_gr_firstab_ak74u: {
    elements: "up_firsta_ak74u",
  },
  up_gr_firstcd_ak74u: {
    elements: "up_firstc_ak74u, up_firstd_ak74u",
  },
  up_gr_firstef_ak74u: {
    elements: "up_firste_ak74u",
  },
  up_gr_seconab_ak74u: {
    elements: "up_secona_ak74u",
  },
  up_gr_seconcd_ak74u: {
    elements: "up_seconc_ak74u",
  },
  up_gr_seconef_ak74u: {
    elements: "up_secone_ak74u, up_seconf_ak74u",
  },
  up_gr_thirdab_ak74u: {
    elements: "up_thirda_ak74u",
  },
  up_gr_thirdcd_ak74u: {
    elements: "up_thirdc_ak74u, up_thirdd_ak74u",
  },
  up_gr_thirdef_ak74u: {
    elements: "up_thirde_ak74u",
  },
  up_gr_fourtab_ak74u: {
    elements: "up_fourta_ak74u",
  },
  up_gr_fourtcd_ak74u: {
    elements: "up_fourtc_ak74u",
  },
  up_gr_fourtef_ak74u: {
    elements: "up_fourte_ak74u",
  },
  up_gr_fifthab_ak74u: {
    elements: "up_fiftha_ak74u",
  },
};
