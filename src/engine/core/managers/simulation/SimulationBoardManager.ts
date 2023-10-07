import { actor_stats, clsid, game_graph, level } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  groupIdByLevelName,
  ISimulationFactionDescriptor,
  ISmartTerrainDescriptor,
  TSimulationObject,
} from "@/engine/core/managers/simulation/simulation_types";
import { SIMULATION_LTX } from "@/engine/core/managers/simulation/SimulationConfig";
import { evaluateSimulationPriority } from "@/engine/core/managers/simulation/utils";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/server/squad/squad_types";
import { abort, assert } from "@/engine/core/utils/assertion";
import { setObjectTeamSquadGroup } from "@/engine/core/utils/community";
import { parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { setSquadRelationToActor } from "@/engine/core/utils/relation";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { TLevel } from "@/engine/lib/constants/levels";
import {
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TCount,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * todo;
 */
export class SimulationBoardManager extends AbstractManager {
  public areDefaultSimulationSquadsSpawned: boolean = false;

  protected factions: LuaArray<ISimulationFactionDescriptor> = new LuaTable();
  protected squads: LuaTable<TNumberId, Squad> = new LuaTable();
  protected smartTerrains: LuaTable<TNumberId, ISmartTerrainDescriptor> = new LuaTable();
  protected smartTerrainsByName: LuaTable<TName, SmartTerrain> = new LuaTable();

  protected temporaryAssignedSquads: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();
  protected temporaryEnteredSquads: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy);
  }

  /**
   * Get list of factions participating in alife simulation.
   *
   * @returns list of factions participating in simulation
   */
  public getFactions(): LuaArray<ISimulationFactionDescriptor> {
    return this.factions;
  }

  /**
   * Get squads participating in simulation.
   *
   * @returns map of squads, where key is id and value is squad server object
   */
  public getSquads(): LuaTable<TNumberId, Squad> {
    return this.squads;
  }

  /**
   * Get list of smart terrain descriptors registered in simulation.
   *
   * @returns list of smart terrains descriptors participating in simulation
   */
  public getSmartTerrainDescriptors(): LuaTable<TNumberId, ISmartTerrainDescriptor> {
    return this.smartTerrains;
  }

  /**
   * Get smart terrain object by name.
   *
   * @param name - smart terrain name to get server object for
   * @returns matching smart terrain server object or null
   */
  public getSmartTerrainByName(name: TName): Optional<SmartTerrain> {
    return this.smartTerrainsByName.get(name);
  }

  /**
   * Get smart terrain simulation descriptor.
   *
   * @param smartTerrainId - id of smart terrain to get descriptor for
   * @returns smart terrain descriptor if it participates in simulation
   */
  public getSmartTerrainDescriptor(smartTerrainId: TNumberId): Optional<ISmartTerrainDescriptor> {
    return this.smartTerrains.get(smartTerrainId);
  }

  /**
   * Get staying squads count for smart terrain.
   *
   * @param smartTerrainId - id of smart terrain to get staying squads count
   * @returns count of squads staying in smart terrain
   */
  public getSmartTerrainPopulation(smartTerrainId: TNumberId): TCount {
    return this.smartTerrains.get(smartTerrainId).stayingSquadsCount;
  }

  /**
   * Get assigned squads count for smart terrain.
   *
   * @param smartTerrainId - id of smart terrain to get count of assigned squads
   * @returns count of squads assigned to smart terrain
   */
  public getSmartTerrainAssignedSquads(smartTerrainId: TNumberId): TCount {
    let count: TCount = 0;

    for (const [k, squad] of this.smartTerrains.get(smartTerrainId).assignedSquads) {
      if (squad.getLogicsScriptTarget() !== null) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * Get simulation target for squad participating in alife.
   *
   * @param squad - squad to generate simulation target for
   * @returns simulation object to target or null based on priorities
   */
  public getSquadSimulationTarget(squad: Squad): Optional<TSimulationObject> {
    const availableTargets: LuaArray<{ priority: TRate; target: TSimulationObject }> = new LuaTable();

    for (const [, target] of registry.simulationObjects) {
      const priority: TRate = target.id === squad.id ? 0 : evaluateSimulationPriority(target, squad);

      if (priority > 0) {
        table.insert(availableTargets, { priority: priority, target: target });
      }
    }

    let mostPriorityTask: Optional<TSimulationObject> = null;

    if (availableTargets.length() > 0) {
      table.sort(availableTargets, (a, b) => a.priority > b.priority);

      // todo: Is it trick to get not first task always?
      let maxId: TNumberId = math.floor(0.3 * availableTargets.length());

      if (maxId === 0) {
        maxId = 1;
      }

      mostPriorityTask = availableTargets.get(math.random(maxId)).target;
    }

    if (mostPriorityTask) {
      return mostPriorityTask;
    } else {
      // Return already assigned target or squad itself.
      return (
        (squad.assignedSmartTerrainId && registry.simulator.object<SmartTerrain>(squad.assignedSmartTerrainId)) || squad
      );
    }
  }

  /**
   * Register smart terrain in simulation.
   *
   * @param smartTerrain - target smart terrain object to register in alife simulation
   */
  public registerSmartTerrain(smartTerrain: SmartTerrain): void {
    simulationLogger.info("Register smart terrain:", smartTerrain.name());

    if (this.smartTerrains.get(smartTerrain.id) !== null) {
      abort("Smart terrain '%s' is already registered in simulation board.", smartTerrain.name());
    }

    this.smartTerrains.set(smartTerrain.id, {
      smartTerrain: smartTerrain,
      assignedSquads: new LuaTable(),
      stayingSquadsCount: 0,
    });
    this.smartTerrainsByName.set(smartTerrain.name(), smartTerrain);
  }

  /**
   * Unregister smart terrain from simulation.
   *
   * @param smartTerrain - target smart terrain to unregister
   */
  public unregisterSmartTerrain(smartTerrain: SmartTerrain): void {
    simulationLogger.info("Unregister smart terrain:", smartTerrain.name());

    if (!this.smartTerrains.has(smartTerrain.id)) {
      abort("Trying to unregister not registered smart terrain '%s'.", smartTerrain.name());
    }

    this.smartTerrains.delete(smartTerrain.id);
    this.smartTerrainsByName.delete(smartTerrain.name());
  }

  /**
   * todo: Description.
   */
  public assignSquadToSmartTerrain(squad: Squad, smartTerrainId: Optional<TNumberId>): void {
    simulationLogger.format("Assign squad to smart terrain: '%s' -> '%s'.", squad.name(), smartTerrainId);

    if (smartTerrainId !== null && !this.smartTerrains.has(smartTerrainId)) {
      if (!this.temporaryAssignedSquads.has(smartTerrainId)) {
        this.temporaryAssignedSquads.set(smartTerrainId, new LuaTable());
      }

      table.insert(this.temporaryAssignedSquads.get(smartTerrainId), squad);

      return;
    }

    let oldSmartTerrainId: Optional<TNumberId> = null;

    if (squad.assignedSmartTerrainId !== null) {
      oldSmartTerrainId = squad.assignedSmartTerrainId;
    }

    if (oldSmartTerrainId !== null && this.smartTerrains.has(oldSmartTerrainId)) {
      const smartTerrain: SmartTerrain = this.smartTerrains.get(oldSmartTerrainId).smartTerrain;

      this.smartTerrains.get(oldSmartTerrainId).assignedSquads.delete(squad.id);
      smartTerrain.mapDisplayManager.updateSmartTerrainMapSpot(smartTerrain);
    }

    if (smartTerrainId === null) {
      squad.assignToSmartTerrain(null);

      return;
    }

    const target: ISmartTerrainDescriptor = this.smartTerrains.get(smartTerrainId);

    squad.assignToSmartTerrain(target.smartTerrain);
    target.assignedSquads.set(squad.id, squad);
    target.smartTerrain.mapDisplayManager.updateSmartTerrainMapSpot(target.smartTerrain);
  }

  /**
   * Create squad in smart terrain.
   *
   * todo: part of smart terrain class?
   *
   * @param smartTerrain - target terrain to create in
   * @param section - name of squad section to create
   * @returns newly created squad
   */
  public createSquad(smartTerrain: SmartTerrain, section: TStringId): Squad {
    simulationLogger.format("Create squad: '%s' -> '%s'.", smartTerrain.name(), section);

    const squad: Squad = registry.simulator.create<Squad>(
      section,
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );

    // logger.info("Creating squad in smart:", squad.name(), smartTerrain.name());

    squad.createSquadMembers(smartTerrain);

    if (squad.relationship) {
      setSquadRelationToActor(squad, squad.relationship);
    }

    this.assignSquadToSmartTerrain(squad, smartTerrain.id);

    for (const squadMember of squad.squad_members()) {
      this.setupObjectSquadAndGroup(squadMember.object);
    }

    return squad;
  }

  /**
   * Release squad and squad members.
   * Un-assigns squad from smart terrain and then releases all squad members.
   *
   * todo: part of smart terrain class?
   *
   * @param squad - target squad object to remove with members including
   */
  public releaseSquad(squad: Squad): void {
    simulationLogger.format("Release squad: '%s'.", squad.name());

    this.exitSmartTerrain(squad, squad.assignedSmartTerrainId);
    this.assignSquadToSmartTerrain(squad, null);

    const squadMembers: LuaTable<TNumberId, boolean> = new LuaTable();

    for (const squadMember of squad.squad_members()) {
      squadMembers.set(squadMember.id, true);
    }

    // Second loop is to prevent iteration breaking when iterating + mutating?
    for (const [id] of squadMembers) {
      const object: Optional<ServerObject> = registry.simulator.object(id);

      if (object !== null) {
        squad.unregister_member(id);
        registry.simulator.release(object, true);
      }
    }

    squad.mapDisplayManager.removeSquadMapSpot(squad);
  }

  /**
   * Register squad in alife simulation.
   *
   * @param squad - target squad to register
   */
  public registerSquad(squad: Squad): void {
    this.squads.set(squad.id, squad);
  }

  /**
   * Unregister squad from simulation.
   *
   * @param squad - target squad to unregister
   */
  public unRegisterSquad(squad: Squad): void {
    this.squads.delete(squad.id);
  }

  /**
   * todo: Description.
   */
  public exitSmartTerrain(squad: Squad, smartTerrainId: Optional<TNumberId>): void {
    simulationLogger.format("Exist smart terrain: '%s' x '%s'.", squad.name(), smartTerrainId);

    if (smartTerrainId === null) {
      return;
    }

    if (squad.enteredSmartTerrainId !== smartTerrainId) {
      return;
    }

    squad.enteredSmartTerrainId = null;

    const smartTerrainDescriptor: Optional<ISmartTerrainDescriptor> = this.smartTerrains.get(smartTerrainId);

    if (smartTerrainDescriptor === null) {
      abort("Smart null while smart_id not null [%s]", tostring(smartTerrainId));
    }

    smartTerrainDescriptor.stayingSquadsCount = smartTerrainDescriptor.stayingSquadsCount - 1;
    smartTerrainDescriptor.assignedSquads.delete(squad.id);
  }

  /**
   * todo: Description.
   */
  public enterSmartTerrain(squad: Squad, smartTerrainId: TNumberId): void {
    if (!this.smartTerrains.has(smartTerrainId)) {
      if (!this.temporaryEnteredSquads.has(smartTerrainId)) {
        this.temporaryEnteredSquads.set(smartTerrainId, new LuaTable());
      }

      table.insert(this.temporaryEnteredSquads.get(smartTerrainId), squad);

      return;
    }

    const smartTerrainDescriptor: ISmartTerrainDescriptor = this.smartTerrains.get(smartTerrainId);

    simulationLogger.format(
      "Enter smart terrain: '%s' -> '%s'.",
      squad.name(),
      smartTerrainDescriptor.smartTerrain.name()
    );

    if (squad.enteredSmartTerrainId) {
      abort("Couldn't enter smart, still in old one. Squad: [%s]", squad.name());
    }

    squad.enteredSmartTerrainId = smartTerrainId;
    squad.isItemListSpawned = false;

    smartTerrainDescriptor.stayingSquadsCount = smartTerrainDescriptor.stayingSquadsCount + 1;
  }

  /**
   * todo;
   * todo: Seems too complex.
   */
  public setupObjectSquadAndGroup(object: ServerCreatureObject): void {
    const levelName: TLevel = level.name();
    const groupId: TNumberId = groupIdByLevelName.get(levelName) || 0;

    // Reload, probably not needed.
    object = registry.simulator.object(object.id)!;

    // todo: Check, probably magic or unused code with duplicated changeTeam calls.
    setObjectTeamSquadGroup(object, object.team, object.squad, groupId);

    const squad: Optional<Squad> = registry.simulator.object<Squad>(object.group_id);

    if (squad === null) {
      return setObjectTeamSquadGroup(object, object.team, 0, object.group);
    }

    let smartTerrain: Optional<SmartTerrain> = null;

    if (squad.currentAction !== null && squad.currentAction.type === ESquadActionType.REACH_TARGET) {
      smartTerrain = registry.simulator.object<SmartTerrain>(squad.assignedTargetId!);
    } else if (squad.assignedSmartTerrainId !== null) {
      smartTerrain = registry.simulator.object<SmartTerrain>(squad.assignedSmartTerrainId);
    }

    if (smartTerrain === null) {
      return setObjectTeamSquadGroup(object, object.team, 0, object.group);
    }

    let objectSquadId: TNumberId = 0;

    if (smartTerrain.clsid() === clsid.smart_terrain) {
      objectSquadId = smartTerrain.squadId;
    }

    setObjectTeamSquadGroup(object, object.team, objectSquadId, object.group);
  }

  /**
   * todo: Description.
   */
  public initializeSmartTerrainSimulation(smartTerrain: SmartTerrain): void {
    // Resolve assigned squads state.
    if (this.temporaryAssignedSquads.has(smartTerrain.id)) {
      for (const [, squad] of this.temporaryAssignedSquads.get(smartTerrain.id)) {
        this.assignSquadToSmartTerrain(squad, smartTerrain.id);
      }

      this.temporaryAssignedSquads.delete(smartTerrain.id);
    }

    // Resolve entered squads state.
    if (this.temporaryEnteredSquads.has(smartTerrain.id)) {
      for (const [, squad] of this.temporaryEnteredSquads.get(smartTerrain.id)) {
        this.enterSmartTerrain(squad, smartTerrain.id);
      }

      this.temporaryEnteredSquads.delete(smartTerrain.id);
    }
  }

  /**
   * Initialize game squads on game start, spawn all pre-defined squads.
   * Easy way to init squads is to use `start_position_%level_name%` section in simulation ltx file.
   * Squads are defined as sections for each level and enter assigned smart terrains.
   */
  public initializeDefaultSimulationSquads(): void {
    if (this.areDefaultSimulationSquadsSpawned) {
      return;
    } else {
      this.areDefaultSimulationSquadsSpawned = true;
    }

    simulationLogger.info("Spawn default simulation squads");

    for (const serverLevel of game_graph().levels()) {
      const levelSectionName: TSection = "start_position_" + registry.simulator.level_name(serverLevel.id);

      // No definitions for the level section.
      if (!SIMULATION_LTX.section_exist(levelSectionName)) {
        return;
      }

      const levelSquadsCount: TCount = SIMULATION_LTX.line_count(levelSectionName);

      for (const it of $range(0, levelSquadsCount - 1)) {
        const [, field, value] = SIMULATION_LTX.r_line(levelSectionName, it, "", "");
        const smartTerrainsNames: LuaArray<TName> = parseStringsList(value);

        for (const [, name] of smartTerrainsNames) {
          const smartTerrain: Optional<SmartTerrain> = this.smartTerrainsByName.get(name);

          assert(smartTerrain, "Wrong smart name '%s' in start position spawning.", name);

          this.enterSmartTerrain(this.createSquad(smartTerrain, field), smartTerrain.id);
        }
      }
    }

    simulationLogger.info("Spawned default simulation squads");
  }

  /**
   * Handle event of actor unregister in network.
   */
  public onActorDestroy(): void {
    simulationLogger.format("Actor network destroy");

    if (actor_stats.remove_from_ranking !== null) {
      actor_stats.remove_from_ranking(ACTOR_ID);
    }

    if (this.factions !== null) {
      for (const [, faction] of this.factions) {
        GlobalSoundManager.getInstance().stopSoundByObjectId(faction.id);
      }
    }
  }

  /**
   * Handle event of actor register in network.
   */
  public onActorRegister(): void {
    simulationLogger.format("Actor network register");
    this.initializeDefaultSimulationSquads();
  }

  public override save(packet: NetPacket): void {
    packet.w_bool(this.areDefaultSimulationSquadsSpawned);
  }

  public override load(reader: NetProcessor): void {
    this.areDefaultSimulationSquadsSpawned = reader.r_bool();
  }
}
