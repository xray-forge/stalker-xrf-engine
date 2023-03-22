import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'bind' entry point", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(typeof container["bind"]).not.toBeNull();
    expect(typeof container["bind"]).toBe("object");
    expect(typeof container["bind"][name]).toBe("function");
  };

  it("should correctly inject binding for game objects", () => {
    require("@/engine/scripts/bind");

    checkBinding("actor");
    checkBinding("anomalyField");
    checkBinding("anomalyZone");
    checkBinding("artefact");
    checkBinding("camp");
    checkBinding("campfire");
    checkBinding("crow");
    checkBinding("heli");
    checkBinding("labX8Door");
    checkBinding("levelChanger");
    checkBinding("monster");
    checkBinding("phantom");
    checkBinding("physicObject");
    checkBinding("restrictor");
    checkBinding("signalLight");
    checkBinding("smartCover");
    checkBinding("smartTerrain");
    checkBinding("stalker");
  });
});
