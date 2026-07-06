import { mockNodeLib } from "@/fixtures/cli/mockNodeLib";
import { mockEngineGlobals } from "@/fixtures/engine/mockEngineGlobals";
import { mockLuaGlobals } from "@/fixtures/lua/mockLuaLib";
import { mockIniFiles } from "@/fixtures/xray/mockIniFiles";
import { mockXRay16 } from "@/fixtures/xray/mockXRay16";

mockNodeLib();
mockEngineGlobals();
mockLuaGlobals();
mockXRay16();
mockIniFiles();
