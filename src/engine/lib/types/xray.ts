import {
  action_base,
  action_planner,
  alife_simulator,
  CALifeSmartTerrainTask,
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
  GameGraph__CVertex,
  hit,
  ini_file,
  net_packet,
  particles_object,
  patrol,
  physics_element,
  physics_shell,
  profile_timer,
  reader,
  sound_object,
  TXR_animation,
  TXR_class_id,
  TXR_entity_action,
  TXR_look,
  TXR_move,
  TXR_net_processor,
  TXR_relation,
  TXR_SightType,
  TXR_snd_type,
  TXR_sound_object_type,
  TXR_TaskState,
  vector,
  world_state,
} from "xray16";

export type ALifeSmartTerrainTask = CALifeSmartTerrainTask;
export type ActionBase = action_base;
export type ActionPlanner = action_planner;
export type AlifeSimulator = alife_simulator;
export type AnyGameObject = game_object | cse_alife_object;
export type ClientObject = game_object;
export type EntityAction = entity_action;
export type FSFileList = FS_file_list_ex;
export type Flags32 = flags32;
export type GameGraphVertex = GameGraph__CVertex;
export type GameHud = CUIGameCustom;
export type GameTask = CGameTask;
export type Hit = hit;
export type IniFile = ini_file;
export type NetPacket = net_packet;
export type NetProcessor = TXR_net_processor;
export type ParticlesObject = particles_object;
export type Patrol = patrol;
export type Phrase = CPhrase;
export type PhraseDialog = CPhraseDialog;
export type PhraseScript = CPhraseScript;
export type PhysicsElement = physics_element;
export type PhysicsShell = physics_shell;
export type ProfileTimer = profile_timer;
export type Reader = reader;
export type SavedGameWrapper = CSavedGameWrapper;
export type ServerAbstractObject = cse_abstract;
export type ServerActorObject = cse_alife_creature_actor;
export type ServerArtefactItemObject = cse_alife_item_artefact;
export type ServerCreatureObject = cse_alife_creature_abstract;
export type ServerGroupObject = cse_alife_online_offline_group;
export type ServerHumanObject = cse_alife_human_abstract;
export type ServerMonsterObject = cse_alife_monster_abstract;
export type ServerObject = cse_alife_object;
export type ServerPhysicObject = cse_alife_object_physic;
export type SoundObject = sound_object;
export type TAnimationType = TXR_animation;
export type TClassId = TXR_class_id;
export type TEntityActionType = TXR_entity_action;
export type TLookType = TXR_look;
export type TMoveType = TXR_move;
export type TRelationType = TXR_relation;
export type TSightType = TXR_SightType;
export type TSoundObjectType = TXR_sound_object_type;
export type TSoundType = TXR_snd_type;
export type TTaskState = TXR_TaskState;
export type Time = CTime;
export type Vector = vector;
export type WorldState = world_state;
export type XmlInit = CScriptXmlInit;
export type ZoneCampfire = CZoneCampfire;
