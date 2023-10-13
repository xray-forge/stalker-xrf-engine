import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";

export const meetConfig = {
  /**
   * Distance to travel from object to forget about meeting state and say hello again.
   */
  MEET_RESET_DISTANCE: 30,
  ENEMY_DEFAULTS: {
    abuse: FALSE,
    isBreakAllowed: TRUE,
    closeAnimation: NIL,
    closeDistance: "0",
    closeSoundBye: NIL,
    close_snd_distance: "0",
    closeSoundHello: NIL,
    closeVictim: NIL,
    farAnimation: NIL,
    farDistance: "0",
    farSound: NIL,
    farSoundDistance: "0",
    farVictim: NIL,
    meetDialog: NIL,
    isMeetOnTalking: FALSE,
    useSound: NIL,
    isTradeEnabled: TRUE,
    use: FALSE,
    useText: NIL,
  } as const,
  NEUTRAL_DEFAULTS: {
    abuse: "{=has_enemy} false, true",
    isBreakAllowed: TRUE,
    closeAnimation: "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_has_weapon} threat_na, talk_default",
    closeDistance: "{=is_wounded} 0, {!is_squad_commander} 0, 3",
    closeSoundBye: NIL,
    close_snd_distance: "{=is_wounded} 0, {!is_squad_commander} 0, 3",
    closeSoundHello:
      "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil," +
      " {=actor_has_weapon} meet_hide_weapon, meet_hello",
    closeVictim: "{=is_wounded} nil, {!is_squad_commander} nil, actor",
    farAnimation: NIL,
    farDistance: "{=is_wounded} 0, {!is_squad_commander} 0, 5",
    farSound: NIL,
    farSoundDistance: "{=is_wounded} 0, {!is_squad_commander} 0, 5",
    farVictim: NIL,
    meetDialog: NIL,
    isMeetOnTalking: TRUE,
    isTradeEnabled: TRUE,
    useSound:
      "{=is_wounded} nil, {!is_squad_commander} meet_use_no_talk_leader, {=actor_enemy} nil," +
      " {=has_enemy} meet_use_no_fight, {=actor_has_weapon} meet_use_no_weapon, nil",
    use:
      "{=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
      " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false",
    useText: NIL,
  } as const,
};
