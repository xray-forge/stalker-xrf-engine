import {
  action_planner,
  alife_simulator,
  CGameTask,
  CPhrase,
  CPhraseDialog,
  CPhraseScript,
  cse_abstract,
  cse_alife_creature_abstract,
  cse_alife_creature_actor,
  cse_alife_object,
  CTime,
  CUIGameCustom,
  CZoneCampfire,
  game_object,
  hit,
  ini_file,
  net_packet,
  patrol,
  profile_timer,
  sound_object,
  TXR_class_id,
  TXR_net_processor,
  TXR_sound_object_type,
  TXR_TaskState,
  vector,
} from "xray16";

export type ActionPlanner = action_planner;
export type AlifeSimulator = alife_simulator;
export type ClientObject = game_object;
export type GameHud = CUIGameCustom;
export type GameTask = CGameTask;
export type Hit = hit;
export type IniFile = ini_file;
export type NetPacket = net_packet;
export type NetProcessor = TXR_net_processor;
export type Patrol = patrol;
export type Phrase = CPhrase;
export type PhraseDialog = CPhraseDialog;
export type PhraseScript = CPhraseScript;
export type ProfileTimer = profile_timer;
export type ServerAbstractObject = cse_abstract;
export type ServerActorObject = cse_alife_creature_actor;
export type ServerCreatureObject = cse_alife_creature_abstract;
export type ServerObject = cse_alife_object;
export type SoundObject = sound_object;
export type TClassId = TXR_class_id;
export type TSoundObjectType = TXR_sound_object_type;
export type TTaskState = TXR_TaskState;
export type Time = CTime;
export type Vector = vector;
export type ZoneCampfire = CZoneCampfire;
