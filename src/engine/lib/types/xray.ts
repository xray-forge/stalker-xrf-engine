import {
  action_base,
  action_planner,
  alife_simulator,
  CALifeSmartTerrainTask,
  CCar,
  CGameTask,
  color,
  cover_point,
  CPhrase,
  CPhraseDialog,
  CPhraseScript,
  CPhysicObject,
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
  danger_object,
  effector_params,
  entity_action,
  flags32,
  FS_file_list_ex,
  game_object,
  GameGraph__CVertex,
  hit,
  ini_file,
  net_packet,
  noise,
  particles_object,
  patrol,
  physics_element,
  physics_joint,
  physics_shell,
  profile_timer,
  property_evaluator,
  property_storage,
  reader,
  sound_object,
  TXR_animation,
  TXR_animation_key,
  TXR_class_id,
  TXR_danger_object,
  TXR_entity_action,
  TXR_look,
  TXR_MonsterBodyStateKey,
  TXR_move,
  TXR_net_processor,
  TXR_relation,
  TXR_SightType,
  TXR_snd_type,
  TXR_sound_key,
  TXR_sound_object_type,
  TXR_TaskState,
  vector,
  vector2,
  world_property,
  world_state,
} from "xray16";

export type ALifeSmartTerrainTask = CALifeSmartTerrainTask;
export type ActionBase = action_base;
export type ActionPlanner = action_planner;
export type AlifeSimulator = alife_simulator;
export type AnyGameObject = game_object | cse_alife_object;
export type Car = CCar;
export type ClientObject = game_object;
export type Color = color;
export type CoverPoint = cover_point;
export type DangerObject = danger_object;
export type EffectorParams = effector_params;
export type EntityAction = entity_action;
export type FSFileList = FS_file_list_ex;
export type Flags32 = flags32;
export type GameGraphVertex = GameGraph__CVertex;
export type GameHud = CUIGameCustom;
export type GameTask = CGameTask;
export type Hit = hit;
export type IniFile = ini_file;
export type MonsterBodyStateKey = TXR_MonsterBodyStateKey;
export type NetPacket = net_packet;
export type NetProcessor = TXR_net_processor;
export type Noise = noise;
export type ParticlesObject = particles_object;
export type Patrol = patrol;
export type Phrase = CPhrase;
export type PhraseDialog = CPhraseDialog;
export type PhraseScript = CPhraseScript;
export type PhysicObject = CPhysicObject;
export type PhysicsElement = physics_element;
export type PhysicsJoint = physics_joint;
export type PhysicsShell = physics_shell;
export type ProfileTimer = profile_timer;
export type PropertyEvaluator = property_evaluator;
export type PropertyStorage = property_storage;
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
export type TAnimationKey = TXR_animation_key;
export type TAnimationType = TXR_animation;
export type TClassId = TXR_class_id;
export type TDangerType = TXR_danger_object;
export type TEntityActionType = TXR_entity_action;
export type TLookType = TXR_look;
export type TMoveType = TXR_move;
export type TRelationType = TXR_relation;
export type TSightType = TXR_SightType;
export type TSoundKey = TXR_sound_key;
export type TSoundObjectType = TXR_sound_object_type;
export type TSoundType = TXR_snd_type;
export type TTaskState = TXR_TaskState;
export type Time = CTime;
export type Vector = vector;
export type Vector2D = vector2;
export type WorldProperty = world_property;
export type WorldState = world_state;
export type XmlInit = CScriptXmlInit;
export type ZoneCampfire = CZoneCampfire;

export enum EClientObjectPath {
  GAME_PATH = game_object.game_path,
  LEVEL_PATH = game_object.level_path,
  PATROL_PATH = game_object.patrol_path,
}

export enum EClientObjectRelation {
  FRIEND = game_object.friend,
  NEUTRAL = game_object.neutral,
  ENEMY = game_object.enemy,
}

export enum EClientObjectMovementType {
  MASK = game_object.alifeMovementTypeMask,
  RANDOM = game_object.alifeMovementTypeRandom,
}
