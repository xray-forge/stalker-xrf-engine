import { actor_stats, clsid, game_graph, level } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { removeSquadMapSpot, updateTerrainMapSpot } from "@/engine/core/managers/map/utils";
import { groupIdByLevelName, ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { SIMULATION_LTX } from "@/engine/core/managers/simulation/SimulationConfig";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { createSquadMembers } from "@/engine/core/objects/squad/creation";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
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
  TSection,
} from "@/engine/lib/types";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * todo;
 */
export class SimulationManager extends AbstractManager {
  public areDefaultSimulationSquadsSpawned: boolean = false;

  protected readonly terrains: LuaTable<TName, SmartTerrain> = new LuaTable();
  protected readonly terrainDescriptors: LuaTable<TNumberId, ISmartTerrainDescriptor> = new LuaTable();
  protected readonly squads: LuaTable<TNumberId, Squad> = new LuaTable();

  protected readonly temporaryAssignedSquads: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy);
  }

  public override save(packet: NetPacket): void {
    packet.w_bool(this.areDefaultSimulationSquadsSpawned);
  }

  public override load(reader: NetProcessor): void {
    this.areDefaultSimulationSquadsSpawned = reader.r_bool();
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
  public getTerrainDescriptors(): LuaTable<TNumberId, ISmartTerrainDescriptor> {
    return this.terrainDescriptors;
  }

  /**
   * @returns map of registered smart terrains by name
   */
  public getTerrains(): LuaTable<TName, SmartTerrain> {
    return this.terrains;
  }

  /**
   * Get smart terrain object by name.
   *
   * @param name - smart terrain name to get server object for
   * @returns matching smart terrain server object or null
   */
  public getTerrainByName(name: TName): Optional<SmartTerrain> {
    return this.terrains.get(name);
  }

  /**
   * Get smart terrain simulation descriptor.
   *
   * @param terrainId - id of smart terrain to get descriptor for
   * @returns smart terrain descriptor if it participates in simulation
   */
  public getTerrainDescriptorById(terrainId: TNumberId): Optional<ISmartTerrainDescriptor> {
    return this.terrainDescriptors.get(terrainId);
  }

  /**
   * Get assigned squads count for smart terrain.
   *
   * @param terrainId - id of smart terrain to get count of assigned squads
   * @returns count of squads assigned to smart terrain
   */
  public getTerrainAssignedSquadsCount(terrainId: TNumberId): TCount {
    let count: TCount = 0;

    for (const [, squad] of this.terrainDescriptors.get(terrainId).assignedSquads) {
      if (!squad.getScriptedSimulationTarget()) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * Register smart terrain in simulation.
   *
   * @param terrain - target smart terrain object to register in alife simulation
   */
  public registerTerrain(terrain: SmartTerrain): void {
    simulationLogger.info("Register smart terrain: %s", terrain.name());

    if (this.terrainDescriptors.has(terrain.id)) {
      abort("Smart terrain '%s' is already registered in simulation board.", terrain.name());
    }

    this.terrains.set(terrain.name(), terrain);
    this.terrainDescriptors.set(terrain.id, {
      terrain: terrain,
      assignedSquads: new LuaTable(),
      assignedSquadsCount: 0,
    });
  }

  /**
   * Unregister smart terrain from simulation.
   *
   * @param terrain - target smart terrain to unregister
   */
  public unregisterTerrain(terrain: SmartTerrain): void {
    simulationLogger.info("Unregister smart terrain: %s", terrain.name());

    if (!this.terrainDescriptors.has(terrain.id)) {
      abort("Trying to unregister not registered smart terrain '%s'.", terrain.name());
    }

    this.terrains.delete(terrain.name());
    this.terrainDescriptors.delete(terrain.id);
  }

  /**
   * todo: Description.
   */
  public assignSquadToTerrain(squad: Squad, terrainId: Optional<TNumberId>): void {
    simulationLogger.info("Assign squad to smart terrain: '%s' -> '%s'.", squad.name(), terrainId);

    if (terrainId !== null && !this.terrainDescriptors.has(terrainId)) {
      if (!this.temporaryAssignedSquads.has(terrainId)) {
        this.temporaryAssignedSquads.set(terrainId, new LuaTable());
      }

      table.insert(this.temporaryAssignedSquads.get(terrainId), squad);

      return;
    }

    const oldTerrainId: Optional<TNumberId> = squad.assignedTerrainId;
    const oldTerrainDescriptor: Optional<ISmartTerrainDescriptor> = oldTerrainId
      ? this.terrainDescriptors.get(oldTerrainId)
      : null;

    if (oldTerrainDescriptor) {
      const oldTerrain: SmartTerrain = oldTerrainDescriptor.terrain;

      oldTerrainDescriptor.assignedSquads.delete(squad.id);
      oldTerrainDescriptor.assignedSquadsCount = this.getTerrainAssignedSquadsCount(oldTerrainId as TNumberId);

      updateTerrainMapSpot(oldTerrain);
    }

    if (terrainId === null) {
      squad.assignToTerrain(null);
    } else {
      const newTerrainDescriptor: ISmartTerrainDescriptor = this.terrainDescriptors.get(terrainId);

      squad.assignToTerrain(newTerrainDescriptor.terrain);

      newTerrainDescriptor.assignedSquads.set(squad.id, squad);
      newTerrainDescriptor.assignedSquadsCount = this.getTerrainAssignedSquadsCount(terrainId);

      updateTerrainMapSpot(newTerrainDescriptor.terrain);
    }
  }

  /**
   * Create squad in smart terrain.
   *
   * todo: part of smart terrain class?
   *
   * @param terrain - target terrain to create in
   * @param section - name of squad section to create
   * @returns newly created squad
   */
  public createSquad(terrain: SmartTerrain, section: TSection): Squad {
    simulationLogger.info("Create squad: '%s' -> '%s'.", terrain.name(), section);

    const squad: Squad = registry.simulator.create<Squad>(
      section,
      terrain.position,
      terrain.m_level_vertex_id,
      terrain.m_game_vertex_id
    );

    createSquadMembers(squad, terrain);

    if (squad.relationship) {
      setSquadRelationToActor(squad, squad.relationship);
    }

    this.assignSquadToTerrain(squad, terrain.id);

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
    simulationLogger.info("Release squad: '%s'.", squad.name());

    this.assignSquadToTerrain(squad, null);

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

    removeSquadMapSpot(squad);
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

    let terrain: Optional<SmartTerrain> = null;

    if (squad.currentAction !== null && squad.currentAction.type === ESquadActionType.REACH_TARGET) {
      terrain = registry.simulator.object<SmartTerrain>(squad.assignedTargetId!);
    } else if (squad.assignedTerrainId !== null) {
      terrain = registry.simulator.object<SmartTerrain>(squad.assignedTerrainId);
    }

    if (terrain === null) {
      return setObjectTeamSquadGroup(object, object.team, 0, object.group);
    }

    let objectSquadId: TNumberId = 0;

    if (terrain.clsid() === clsid.smart_terrain) {
      objectSquadId = terrain.squadId;
    }

    setObjectTeamSquadGroup(object, object.team, objectSquadId, object.group);
  }

  /**
   * todo: Description.
   */
  public initializeTerrainSimulation(terrain: SmartTerrain): void {
    // Resolve assigned squads state.
    if (this.temporaryAssignedSquads.has(terrain.id)) {
      for (const [, squad] of this.temporaryAssignedSquads.get(terrain.id)) {
        this.assignSquadToTerrain(squad, terrain.id);
      }

      this.temporaryAssignedSquads.delete(terrain.id);
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
        const terrainsNames: LuaArray<TName> = parseStringsList(value);

        for (const [, name] of terrainsNames) {
          const terrain: Optional<SmartTerrain> = this.terrains.get(name);

          assert(terrain, "Wrong smart name '%s' in start position spawning.", name);

          this.assignSquadToTerrain(this.createSquad(terrain, field), terrain.id);
        }
      }
    }

    simulationLogger.info("Spawned default simulation squads");
  }

  /**
   * Handle event of actor unregister in network.
   */
  public onActorDestroy(): void {
    simulationLogger.info("Actor network destroy");

    if (actor_stats.remove_from_ranking !== null) {
      actor_stats.remove_from_ranking(ACTOR_ID);
    }
  }

  /**
   * Handle event of actor register in network.
   */
  public onActorRegister(): void {
    simulationLogger.info("Actor network register");
    this.initializeDefaultSimulationSquads();
  }
}
