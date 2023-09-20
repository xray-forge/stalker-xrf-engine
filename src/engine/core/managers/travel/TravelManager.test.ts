import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { TravelManager } from "@/engine/core/managers/travel/TravelManager";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import { ClientObject, ServerCreatureObject, ServerGroupObject, ServerSmartZoneObject } from "@/engine/lib/types";
import {
  mockActorClientGameObject,
  mockClientGameObject,
  MockPhraseDialog,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";

describe("TravelManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize callbacks", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const manager: TravelManager = TravelManager.getInstance();

    manager.initialize();
    expect(eventsManager.getSubscribersCount()).toBe(1);

    manager.destroy();
    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly initialize and destroy", () => {
    const manager: TravelManager = TravelManager.getInstance();

    manager.initialize();

    expect(TravelManager.SMART_TRAVEL_DISTANCE_MIN_THRESHOLD).toBe(50);
    expect(TravelManager.SMART_TRAVEL_TELEPORT_DELAY).toBe(3000);
    expect(TravelManager.SMART_TRAVEL_RESOLVE_DELAY).toBe(6000);

    expect(manager.isTraveling).toBe(false);
    expect(manager.isTravelTeleported).toBe(false);
    expect(manager.travelingStartedAt).toBe(0);

    expect(manager.smartDescriptionsByName).toEqualLuaTables({
      zat_a1: "st_stalker_zat_a1",
      zat_sim_1: "st_stalker_zat_sim_1",
      zat_sim_2: "st_stalker_zat_sim_2",
    });
    expect(manager.smartTravelDescriptorsByName).toEqualLuaTables({
      zat_b100: {
        condlist: parseConditionsList(TRUE),
        level: "zaton",
        name: "st_zat_b100_name",
        phraseId: "1002",
      },
      zat_b55: {
        condlist: parseConditionsList(TRUE),
        level: "zaton",
        name: "st_zat_b55_name",
        phraseId: "1001",
      },
      zat_stalker_base_smart: {
        condlist: parseConditionsList(TRUE),
        name: "st_zat_a2_name",
        level: "zaton",
        phraseId: "1000",
      },
    });
    expect(manager.smartNamesByPhraseId).toEqualLuaTables({
      "1000": "zat_stalker_base_smart",
      "1001": "zat_b55",
      "1002": "zat_b100",
    });
  });

  it("should correctly initialize travel dialog phrases", () => {
    const manager: TravelManager = TravelManager.getInstance();
    const dialog: MockPhraseDialog = MockPhraseDialog.create();

    manager.initialize();
    manager.initializeTravellerDialog(MockPhraseDialog.mock(dialog));

    expect(dialog.list).toEqual({
      "if you see this - this is bad": {
        id: "if you see this - this is bad",
        goodwillLevel: -10000,
        prevPhraseId: "1002",
        script: {
          text: "travel_callbacks.getTravelConst",
        },
        text: "1002_1",
      },
      dm_traveler_what_are_you_doing: {
        id: "dm_traveler_what_are_you_doing",
        goodwillLevel: -10000,
        prevPhraseId: "",
        script: {},
        text: "0",
      },
      dm_traveler_can_i_go_with_you: {
        id: "dm_traveler_can_i_go_with_you",
        goodwillLevel: -10000,
        prevPhraseId: "1",
        script: {
          precondition: "travel_callbacks.canActorMoveWithSquad",
        },
        text: "11",
      },
      dm_traveler_actor_agree: {
        id: "dm_traveler_actor_agree",
        goodwillLevel: -10000,
        prevPhraseId: "1002_1",
        script: {
          precondition: "travel_callbacks.isEnoughMoneyToTravel",
        },
        text: "1002_11",
      },
      dm_traveler_actor_dont_go_with_squad: {
        id: "dm_traveler_actor_dont_go_with_squad",
        goodwillLevel: -10000,
        prevPhraseId: "111",
        script: {},
        text: "1112",
      },
      dm_traveler_actor_go_with_squad: {
        id: "dm_traveler_actor_go_with_squad",
        goodwillLevel: -10000,
        prevPhraseId: "111",
        script: {
          precondition: "travel_callbacks.onTravelTogetherWithSquad",
        },
        text: "1111",
      },
      dm_traveler_actor_has_no_money: {
        id: "dm_traveler_actor_has_no_money",
        goodwillLevel: -10000,
        prevPhraseId: "1002_1",
        script: {
          precondition: "travel_callbacks.isNotEnoughMoneyToTravel",
        },
        text: "1002_13",
      },
      dm_traveler_actor_refuse: {
        id: "dm_traveler_actor_refuse",
        goodwillLevel: -10000,
        prevPhraseId: "121",
        script: {},
        text: "1211",
      },
      dm_traveler_bye: {
        id: "dm_traveler_bye",
        goodwillLevel: -10000,
        prevPhraseId: "1",
        script: {},
        text: "13",
      },
      dm_traveler_stalker_actor_companion_no: {
        id: "dm_traveler_stalker_actor_companion_no",
        goodwillLevel: -10000,
        prevPhraseId: "11",
        script: {
          precondition: "travel_callbacks.cannotSquadTakeActor",
        },
        text: "112",
      },
      dm_traveler_stalker_actor_companion_yes: {
        id: "dm_traveler_stalker_actor_companion_yes",
        goodwillLevel: -10000,
        prevPhraseId: "11",
        script: {
          precondition: "travel_callbacks.canSquadTakeActor",
        },
        text: "111",
      },
      dm_traveler_stalker_i_cant_travel: {
        id: "dm_traveler_stalker_i_cant_travel",
        goodwillLevel: -10000,
        prevPhraseId: "12",
        script: {
          precondition: "travel_callbacks.cannotSquadTravel",
        },
        text: "122",
      },
      dm_traveler_stalker_where_do_you_want: {
        id: "dm_traveler_stalker_where_do_you_want",
        goodwillLevel: -10000,
        prevPhraseId: "12",
        script: {
          precondition: "travel_callbacks.canSquadTravel",
        },
        text: "121",
      },
      dm_traveler_take_me_to: {
        id: "dm_traveler_take_me_to",
        goodwillLevel: -10000,
        prevPhraseId: "1",
        script: {},
        text: "12",
      },
      "translated_st_zat_a2_name.": {
        id: "translated_st_zat_a2_name.",
        goodwillLevel: -10000,
        prevPhraseId: "121",
        script: {
          precondition: "travel_callbacks.canNegotiateTravelToSmart",
        },
        text: "1000",
      },
      "translated_st_zat_b100_name.": {
        id: "translated_st_zat_b100_name.",
        goodwillLevel: -10000,
        prevPhraseId: "121",
        script: {
          precondition: "travel_callbacks.canNegotiateTravelToSmart",
        },
        text: "1002",
      },
      "translated_st_zat_b55_name.": {
        id: "translated_st_zat_b55_name.",
        goodwillLevel: -10000,
        prevPhraseId: "121",
        script: {
          precondition: "travel_callbacks.canNegotiateTravelToSmart",
        },
        text: "1001",
      },
    });
  });

  it("should correctly check if can use travel dialogs", () => {
    const manager: TravelManager = TravelManager.getInstance();
    const squad: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const smartZone: ServerSmartZoneObject = mockServerAlifeSmartZone({ name: <T>() => "jup_b41" as T });
    const serverObject: ServerCreatureObject = mockServerAlifeHumanStalker({ group_id: squad.id });
    const object: ClientObject = mockClientGameObject({ idOverride: serverObject.id });
    const actor: ClientObject = mockActorClientGameObject();

    squad.commander_id = () => object.id();
    object.character_community = <T>() => "stalker" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);

    squad.commander_id = () => -1;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    squad.commander_id = () => object.id();
    object.character_community = <T>() => "bandit" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    object.character_community = <T>() => "army" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    object.character_community = <T>() => "freedom" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);

    serverObject.m_smart_terrain_id = smartZone.id;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    smartZone.name = <T>() => "random_smart" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);
  });

  it.todo("should correctly check if can use with squad");

  it.todo("should correctly generate current action description for squads");

  it.todo("should correctly check if smart reachable");

  it.todo("should correctly check if squad can travel");

  it.todo("should correctly check if can negotiate traveling");

  it("should correctly calculate travel price", () => {
    const manager: TravelManager = TravelManager.getInstance();

    expect(manager.getTravelPriceByDistance(10)).toBe(50);
    expect(manager.getTravelPriceByDistance(100)).toBe(100);
    expect(manager.getTravelPriceByDistance(500)).toBe(500);
    expect(manager.getTravelPriceByDistance(750)).toBe(750);
    expect(manager.getTravelPriceByDistance(1500)).toBe(1500);
  });

  it.todo("should correctly calculate travel price for phrases");

  it.todo("should correctly calculate generate travel cost strings");

  it.todo("should correctly check if actor has enough money for traveling");

  it.todo("should correctly handle traveling with squad somewhere");

  it.todo("should correctly handle traveling with squad to specific destination");

  it.todo("should correctly handle updates");
});
