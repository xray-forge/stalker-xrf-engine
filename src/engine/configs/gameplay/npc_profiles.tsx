import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { Character } from "@/engine/configs/gameplay/utils/Character";

export function create(): JSXNode {
  return (
    <xml>
      <ActorProfiles />
      <DutyProfiles />
      <MonolithProfiles />
      <FreedomProfiles />
      <BanditProfiles />
      <StalkerProfiles />
      <ArmyProfiles />
      <MercenaryProfiles />
      <ZombiedProfiles />
      <SpecificProfiles />
    </xml>
  );
}

function ActorProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"actor"} className={"Actor"} specificCharacter={"actor"} />
      <Character id={"default"} className={"Stalker_general"} />
      <Character id={"mp_actor"} specificCharacter={"mp_actor"} />
      <Character id={"actor_visual_stalker"} />
    </Fragment>
  );
}

export function DutyProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_duty_0"} />
      <Character id={"sim_default_duty_1"} />
      <Character id={"sim_default_duty_2"} />
      <Character id={"sim_default_duty_3"} />
      <Character id={"sim_default_duty_4"} />
    </Fragment>
  );
}

export function BanditProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_bandit_0"} />
      <Character id={"sim_default_bandit_1"} />
      <Character id={"sim_default_bandit_2"} />
      <Character id={"sim_default_bandit_3"} />
      <Character id={"sim_default_bandit_4"} />
    </Fragment>
  );
}

export function MercenaryProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_killer_0"} />
      <Character id={"sim_default_killer_1"} />
      <Character id={"sim_default_killer_2"} />
      <Character id={"sim_default_killer_3"} />
      <Character id={"sim_default_killer_4"} />
    </Fragment>
  );
}

export function ArmyProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_military_0"} />
      <Character id={"sim_default_military_1"} />
      <Character id={"sim_default_military_2"} />
      <Character id={"sim_default_military_3"} />
      <Character id={"sim_default_military_3_sniper"} />
      <Character id={"sim_default_military_4"} />
    </Fragment>
  );
}

export function StalkerProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_stalker_0"} />
      <Character id={"sim_default_stalker_1"} />
      <Character id={"sim_default_stalker_2"} />
      <Character id={"sim_default_stalker_3"} />
      <Character id={"sim_default_stalker_4"} />
    </Fragment>
  );
}

export function FreedomProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_freedom_0"} />
      <Character id={"sim_default_freedom_1"} />
      <Character id={"sim_default_freedom_2"} />
      <Character id={"sim_default_freedom_3"} />
      <Character id={"sim_default_freedom_4"} />
    </Fragment>
  );
}

export function MonolithProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_monolith_0"} />
      <Character id={"sim_default_monolith_1"} />
      <Character id={"sim_default_monolith_2"} />
      <Character id={"sim_default_monolith_3"} />
      <Character id={"sim_default_monolith_4"} />
    </Fragment>
  );
}

export function ZombiedProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"sim_default_zombied_1"} />
      <Character id={"sim_default_zombied_2"} />
      <Character id={"sim_default_zombied_3"} />
      <Character id={"sim_default_zombied_4"} />
    </Fragment>
  );
}

export function SpecificProfiles(): JSXNode {
  return (
    <Fragment>
      <Character id={"zat_b106_stalker_gonta"} />
      <Character id={"zat_b14_stalker_1"} />
      <Character id={"zat_b38_stalker_cop"} />
      <Character id={"zat_b38_stalker_corpse_1"} />
      <Character id={"zat_b38_stalker_corpse_2"} />
      <Character id={"zat_b38_stalker_corpse_3"} />
      <Character id={"zat_b38_stalker_cop_dead"} />
      <Character id={"zat_b38_stalker_hunter"} />

      <Character id={"zat_b30_owl_stalker_trader"} />
      <Character id={"zat_b7_duty_illicit_dealer"} />
      <Character id={"zat_b5_stalker_raider_1"} />
      <Character id={"zat_b5_stalker_raider_2"} />
      <Character id={"zat_b5_stalker_raider_3"} />
      <Character id={"zat_b5_stalker_raider_4"} />
      <Character id={"zat_b5_stalker_raider_leader"} />

      <Character id={"zat_b7_bandit_boss_dead"} />
      <Character id={"zat_b5_stalker_commander"} />
      <Character id={"zat_b5_stalker_commander_b7"} />
      <Character id={"zat_b5_stalker_1"} />
      <Character id={"zat_b5_stalker_2"} />
      <Character id={"zat_b5_stalker_3"} />
      <Character id={"zat_b5_stalker_4"} />
      <Character id={"zat_b5_dealer_assistant_1"} />
      <Character id={"zat_b5_dealer_assistant_2"} />
      <Character id={"zat_b7_bandit_boss_sultan"} />

      <Character id={"zat_b18_noah"} />

      <Character id={"pri_a17_military_captain_tarasov"} />
      <Character id={"pri_a17_military_prapor_valentyr"} />
      <Character id={"pri_a17_military_sergeant_morozov"} />
      <Character id={"pri_a17_military_lieutenant_podorojniy"} />
      <Character id={"pri_a17_monolith_preacher"} />
      <Character id={"pri_a17_military_colonel_kovalski"} />

      <Character id={"pri_a15_military_recon_leader"} />
      <Character id={"pri_a15_military_recon_1"} />
      <Character id={"pri_a15_military_recon_2"} />
      <Character id={"pri_a15_military_recon_3"} />

      <Character id={"jup_b218_vano_in_suit"} />
      <Character id={"pri_a15_sokolov"} />
      <Character id={"pri_a15_sokolov_sci"} />
      <Character id={"pri_a15_sokolov_sci_head"} />
      <Character id={"pri_a22_military_merkulov"} />
      <Character id={"pri_a22_military_skelja"} />

      <Character id={"pri_a21_sentry_lieutenant_stecenko"} />

      <Character id={"jup_a12_stalker_assaulter"} />
      <Character id={"jup_a12_stalker_diplomat"} />
      <Character id={"jup_a12_stalker_prisoner"} />
      <Character id={"jup_a12_bandit_chief"} />
      <Character id={"jup_a12_bandit_guard"} />
      <Character id={"jup_a12_bandit_cashier"} />
      <Character id={"jup_a12_merc_cover"} />

      <Character id={"jup_b207_merc_illicit_dealer"} />
      <Character id={"jup_b207_merc_leader"} />
      <Character id={"jup_b207_duty_security_squad_leader"} />
      <Character id={"jup_b207_freedom_recon_squad_leader"} />
      <Character id={"jup_b207_freedom_assault_squad_leader"} />

      <Character id={"jup_a10_bandit_leader"} />
      <Character id={"jup_a10_stalker_vano"} />

      <Character id={"jup_b6_scientist_biochemist"} />
      <Character id={"jup_b6_scientist_nuclear_physicist"} />

      <Character id={"jup_b9_shliachin"} />

      <Character id={"jup_b217_stalker_tech"} />
      <Character id={"jup_b10_stalker_drunk"} />
      <Character id={"jup_b10_stalker_drunk_dead"} />

      <Character id={"jup_b220_trapper"} />

      <Character id={"jup_b4_monolith_squad_leader_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_leader_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_leader_freedom_skin"} />
      <Character id={"jup_b4_monolith_squad_leader_freedom_mon_skin"} />
      <Character id={"jup_b4_monolith_squad_leader_duty_mon_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_1_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_1_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_1_freedom_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_2_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_2_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_2_freedom_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_3_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_3_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_3_freedom_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_4_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_4_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_4_freedom_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_5_monolith_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_5_duty_skin"} />
      <Character id={"jup_b4_monolith_squad_soldier_5_freedom_skin"} />
      <Character id={"jup_b4_freedom_help"} />
      <Character id={"jup_b4_duty_help"} />
      <Character id={"jup_b4_freedom_leader"} />
      <Character id={"jup_b4_duty_leader"} />

      <Character id={"jup_b6_scientist_tech"} />
      <Character id={"jup_b1_stalker_1"} />
      <Character id={"jup_b1_stalker_2"} />
      <Character id={"jup_b1_stalker_3"} />
      <Character id={"jup_b1_stalker_4"} />

      <Character id={"jup_b1_pro_stalker_1"} />
      <Character id={"jup_b1_pro_stalker_2"} />
      <Character id={"jup_b1_pro_stalker_3"} />
      <Character id={"jup_b1_pro_stalker_4"} />

      <Character id={"jup_b6_freedom_stalker_1"} />
      <Character id={"jup_b6_freedom_stalker_2"} />
      <Character id={"jup_b6_freedom_stalker_3"} />
      <Character id={"jup_b6_freedom_stalker_4"} />

      <Character id={"jup_b6_duty_stalker_1"} />
      <Character id={"jup_b6_duty_stalker_2"} />
      <Character id={"jup_b6_duty_stalker_3"} />
      <Character id={"jup_b6_duty_stalker_4"} />
      <Character id={"jup_b6_stalker_prisoner"} />
      <Character id={"jup_b6_stalker_assaulter"} />
      <Character id={"jup_b6_stalker_diplomat"} />
      <Character id={"jup_b6_stalker_gonta"} />
      <Character id={"jup_b6_stalker_garmata"} />
      <Character id={"jup_b6_stalker_crab"} />

      <Character id={"zat_a2_stalker_barmen"} />
      <Character id={"zat_a2_stalker_mechanic"} />
      <Character id={"zat_a2_stalker_nimble"} />

      <Character id={"zat_b22_stalker_medic"} />

      <Character id={"jup_b25_stalker_senya"} />
      <Character id={"jup_b25_freedom_flint"} />

      <Character id={"zat_b103_lost_merc_leader"} />
      <Character id={"zat_b103_lost_merc_1"} />
      <Character id={"zat_b103_lost_merc_2"} />
      <Character id={"zat_b103_lost_merc_3"} />
      <Character id={"zat_b103_lost_merc_4"} />
      <Character id={"zat_b103_lost_merc_5"} />
      <Character id={"zat_b103_lost_merc_6"} />
      <Character id={"zat_b103_lost_merc_7"} />

      <Character id={"zat_b7_stalker_raider_leader"} />
      <Character id={"zat_b7_stalker_raider_1"} />
      <Character id={"zat_b7_stalker_raider_2"} />
      <Character id={"zat_b7_stalker_raider_3"} />
      <Character id={"zat_b7_stalker_victim_1"} />

      <Character id={"zat_b33_stalker_snag"} />

      <Character id={"zat_b28_draper"} />
      <Character id={"zat_b28_umerov"} />
      <Character id={"zat_b28_smoliak"} />

      <Character id={"zat_b100_military_1"} />
      <Character id={"zat_b100_military_2"} />
      <Character id={"zat_b100_military_3"} />

      <Character id={"zat_b42_mayron"} />

      <Character id={"zat_b29_stalker_rival_1"} />
      <Character id={"zat_b29_stalker_rival_2"} />
      <Character id={"zat_b29_stalker_rival_default_1"} />
      <Character id={"zat_b29_stalker_rival_default_2"} />

      <Character id={"zat_b52_port_bandit_leader"} />

      <Character id={"jup_a6_stalker_medik"} />

      <Character id={"jup_b15_zulus"} />

      <Character id={"jup_b202_stalker_snag"} />
      <Character id={"jup_b202_bandit"} />

      <Character id={"jup_a6_stalker_barmen"} />

      <Character id={"jup_b19_freedom_yar"} />
      <Character id={"jup_b19_merc_1"} />
      <Character id={"jup_b19_merc_2"} />
      <Character id={"jup_b19_merc_3"} />
      <Character id={"jup_b19_merc_4"} />
      <Character id={"jup_b19_merc_5"} />

      <Character id={"jup_b43_stalker_assistant"} />

      <Character id={"zat_b215_stalker_guide"} />

      <Character id={"pri_a25_army_medic"} />

      <Character id={"pri_a15_actor"} />
      <Character id={"pri_a15_vano"} />
      <Character id={"pri_a15_sokolov_scene"} />
      <Character id={"pri_a15_zulus"} />
      <Character id={"pri_a15_wanderer"} />
      <Character id={"pri_a15_military_tarasov"} />
      <Character id={"pri_a15_military_2"} />
      <Character id={"pri_a15_military_3"} />
      <Character id={"pri_a15_military_4"} />

      <Character id={"pri_a22_army_signaller"} />
      <Character id={"pri_b35_merc_leader"} />
      <Character id={"pri_b35_merc_grenade_launcher_1"} />
      <Character id={"pri_b35_merc_grenade_launcher_2"} />
      <Character id={"pri_b35_envoy"} />
      <Character id={"pri_b35_guard_envoy_1"} />
      <Character id={"pri_b35_guard_envoy_2"} />

      <Character id={"pri_b306_envoy"} />

      <Character id={"jup_b46_duty_founder"} />
      <Character id={"jup_b46_duty_founder_squad_01"} />
      <Character id={"jup_b46_duty_founder_squad_02"} />
      <Character id={"jup_b46_duty_founder_squad_03"} />
      <Character id={"jup_b46_duty_founder_squad_04"} />

      <Character id={"jup_a6_freedom_leader"} />
      <Character id={"jup_a6_duty_leader"} />

      <Character id={"zat_b40_merc_squad_leader_1"} />
      <Character id={"zat_b40_merc_squad_leader_2"} />

      <Character id={"zat_b20_noah_teleport"} />

      <Character id={"zat_b44_stalker_barge"} />

      <Character id={"pri_b36_monolith_sniper"} />
      <Character id={"pri_b36_monolith_master_hiding_place"} />
      <Character id={"pri_b36_monolith_marine_sniper"} />

      <Character id={"zat_b53_artefact_hunter_1"} />
      <Character id={"zat_b53_artefact_hunter_2"} />

      <Character id={"pri_a22_military_yarmoshuk"} />

      <Character id={"pri_b305_strelok"} />

      <Character id={"pri_a28_evac_com"} />

      <Character id={"zat_b106_stalker_garmata"} />
      <Character id={"zat_b106_stalker_crab"} />

      <Character id={"jup_b47_merc_01"} />
      <Character id={"jup_b47_merc_02"} />
      <Character id={"jup_b47_merc_03"} />
      <Character id={"jup_b47_merc_04"} />
      <Character id={"jup_b47_merc_05"} />
      <Character id={"jup_b47_merc_06"} />
      <Character id={"jup_b47_merc_07"} />

      <Character id={"jup_b219_stalker_tech"} />
      <Character id={"jup_b219_monolith_squad_leader_freedom_skin"} />
      <Character id={"jup_b219_vano"} />
      <Character id={"jup_b219_soldier"} />
      <Character id={"jup_b219_zulus"} />

      <Character id={"pas_b400_vano"} />
      <Character id={"pas_b400_sokolov"} />
      <Character id={"pas_b400_zulus"} />
      <Character id={"pas_b400_wanderer"} />
      <Character id={"pas_b400_monolith_sniper"} />
      <Character id={"sim_default_stalker_pri_a16"} />
    </Fragment>
  );
}
