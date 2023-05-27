import {
  action_base,
  action_planner,
  alife_simulator,
  CGameTask,
  CPhrase,
  CPhraseDialog,
  CPhraseScript,
  CSavedGameWrapper,
  CScriptXmlInit,
  cse_abstract,
  cse_alife_creature_abstract,
  cse_alife_creature_actor,
  cse_alife_human_abstract,
  cse_alife_item_artefact,
  cse_alife_monster_abstract,
  cse_alife_object,
  cse_alife_object_physic,
  cse_alife_online_offline_group,
  CTime,
  CUIGameCustom,
  CZoneCampfire,
  entity_action,
  flags32,
  FS_file_list_ex,
  game_object,
  hit,
  ini_file,
  net_packet,
  patrol,
  profile_timer,
  sound_object,
  TXR_class_id,
  TXR_entity_action,
  TXR_net_processor,
  TXR_relation,
  TXR_snd_type,
  TXR_sound_object_type,
  TXR_TaskState,
  vector,
} from "xray16";

export type ActionBase = action_base;
export type ActionPlanner = action_planner;
export type AlifeSimulator = alife_simulator;
export type AnyGameObject = game_object | cse_alife_object;
export type ClientObject = game_object;
export type EntityAction = entity_action;
export type FSFileList = FS_file_list_ex;
export type Flags32 = flags32;
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
export type SavedGameWrapper = CSavedGameWrapper;
export type ServerAbstractObject = cse_abstract;
export type ServerActorObject = cse_alife_creature_actor;
export type ServerMonsterObject = cse_alife_monster_abstract;
export type ServerArtefactItemObject = cse_alife_item_artefact;
export type ServerCreatureObject = cse_alife_creature_abstract;
export type ServerGroupObject = cse_alife_online_offline_group;
export type ServerHumanObject = cse_alife_human_abstract;
export type ServerObject = cse_alife_object;
export type ServerPhysicObject = cse_alife_object_physic;
export type SoundObject = sound_object;
export type TClassId = TXR_class_id;
export type TEntityActionType = TXR_entity_action;
export type TRelationType = TXR_relation;
export type TSoundObjectType = TXR_sound_object_type;
export type TSoundType = TXR_snd_type;
export type TTaskState = TXR_TaskState;
export type Time = CTime;
export type Vector = vector;
export type XmlInit = CScriptXmlInit;
export type ZoneCampfire = CZoneCampfire;
