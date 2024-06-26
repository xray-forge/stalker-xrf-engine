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
  TStringId,
} from "@/engine/lib/types";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * todo;
 */
export class SimulationManager extends AbstractManager {
  public areDefaultSimulationSquadsSpawned: boolean = false;

  protected readonly smartTerrains: LuaTable<TName, SmartTerrain> = new LuaTable();
  protected readonly smartTerrainDescriptors: LuaTable<TNumberId, ISmartTerrainDescriptor> = new LuaTable();
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
    return this.smartTerrainDescriptors;
  }

  /**
   * @returns map of registered smart terrains by name
   */
  public getSmartTerrains(): LuaTable<TName, SmartTerrain> {
    return this.smartTerrains;
  }

  /**
   * Get smart terrain object by name.
   *
   * @param name - smart terrain name to get server object for
   * @returns matching smart terrain server object or null
   */
  public getSmartTerrainByName(name: TName): Optional<SmartTerrain> {
    return this.smartTerrains.get(name);
  }

  /**
   * Get smart terrain simulation descriptor.
   *
   * @param smartTerrainId - id of smart terrain to get descriptor for
   * @returns smart terrain descriptor if it participates in simulation
   */
  public getSmartTerrainDescriptor(smartTerrainId: TNumberId): Optional<ISmartTerrainDescriptor> {
    return this.smartTerrainDescriptors.get(smartTerrainId);
  }

  /**
   * Get assigned squads count for smart terrain.
   *
   * @param smartTerrainId - id of smart terrain to get count of assigned squads
   * @returns count of squads assigned to smart terrain
   */
  public getSmartTerrainAssignedSquadsCount(smartTerrainId: TNumberId): TCount {
    let count: TCount = 0;

    for (const [, squad] of this.smartTerrainDescriptors.get(smartTerrainId).assignedSquads) {
      if (!squad.getScriptedSimulationTarget()) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * Register smart terrain in simulation.
   *
   * @param smartTerrain - target smart terrain object to register in alife simulation
   */
  public registerSmartTerrain(smartTerrain: SmartTerrain): void {
    simulationLogger.info("Register smart terrain: %s", smartTerrain.name());

    if (this.smartTerrainDescriptors.has(smartTerrain.id)) {
      abort("Smart terrain '%s' is already registered in simulation board.", smartTerrain.name());
    }

    this.smartTerrains.set(smartTerrain.name(), smartTerrain);
    this.smartTerrainDescriptors.set(smartTerrain.id, {
      smartTerrain: smartTerrain,
      assignedSquads: new LuaTable(),
      assignedSquadsCount: 0,
    });
  }

  /**
   * Unregister smart terrain from simulation.
   *
   * @param smartTerrain - target smart terrain to unregister
   */
  public unregisterSmartTerrain(smartTerrain: SmartTerrain): void {
    simulationLogger.info("Unregister smart terrain: %s", smartTerrain.name());

    if (!this.smartTerrainDescriptors.has(smartTerrain.id)) {
      abort("Trying to unregister not registered smart terrain '%s'.", smartTerrain.name());
    }

    this.smartTerrains.delete(smartTerrain.name());
    this.smartTerrainDescriptors.delete(smartTerrain.id);
  }

  /**
   * todo: Description.
   */
  public assignSquadToSmartTerrain(squad: Squad, smartTerrainId: Optional<TNumberId>): void {
    simulationLogger.info("Assign squad to smart terrain: '%s' -> '%s'.", squad.name(), smartTerrainId);

    if (smartTerrainId !== null && !this.smartTerrainDescriptors.has(smartTerrainId)) {
      if (!this.temporaryAssignedSquads.has(smartTerrainId)) {
        this.temporaryAssignedSquads.set(smartTerrainId, new LuaTable());
      }

      table.insert(this.temporaryAssignedSquads.get(smartTerrainId), squad);

      return;
    }

    const oldSmartTerrainId: Optional<TNumberId> = squad.assignedSmartTerrainId;
    const oldSmartTerrainDescriptor: Optional<ISmartTerrainDescriptor> = oldSmartTerrainId
      ? this.smartTerrainDescriptors.get(oldSmartTerrainId)
      : null;

    if (oldSmartTerrainDescriptor) {
      const oldSmartTerrain: SmartTerrain = oldSmartTerrainDescriptor.smartTerrain;

      oldSmartTerrainDescriptor.assignedSquads.delete(squad.id);
      oldSmartTerrainDescriptor.assignedSquadsCount = this.getSmartTerrainAssignedSquadsCount(
        oldSmartTerrainId as TNumberId
      );

      updateTerrainMapSpot(oldSmartTerrain);
    }

    if (smartTerrainId === null) {
      squad.assignToSmartTerrain(null);
    } else {
      const newSmartTerrainDescriptor: ISmartTerrainDescriptor = this.smartTerrainDescriptors.get(smartTerrainId);

      squad.assignToSmartTerrain(newSmartTerrainDescriptor.smartTerrain);

      newSmartTerrainDescriptor.assignedSquads.set(squad.id, squad);
      newSmartTerrainDescriptor.assignedSquadsCount = this.getSmartTerrainAssignedSquadsCount(smartTerrainId);

      updateTerrainMapSpot(newSmartTerrainDescriptor.smartTerrain);
    }
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
    simulationLogger.info("Create squad: '%s' -> '%s'.", smartTerrain.name(), section);

    const squad: Squad = registry.simulator.create<Squad>(
      section,
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );

    createSquadMembers(squad, smartTerrain);

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
    simulationLogger.info("Release squad: '%s'.", squad.name());

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
          const smartTerrain: Optional<SmartTerrain> = this.smartTerrains.get(name);

          assert(smartTerrain, "Wrong smart name '%s' in start position spawning.", name);

          this.assignSquadToSmartTerrain(this.createSquad(smartTerrain, field), smartTerrain.id);
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

  public override save(packet: NetPacket): void {
    packet.w_bool(this.areDefaultSimulationSquadsSpawned);
  }

  public override load(reader: NetProcessor): void {
    this.areDefaultSimulationSquadsSpawned = reader.r_bool();
  }
}
