/**
 * List of available game modes based on bit masks.
 */
export const gameTypes = {
  // -- game internal types, do not change
  eGameIDNoGame: 0,
  eGameIDSingle: 1, // --u32(1) << 0,
  eGameIDDeathmatch: 2, // --u32(1) << 1,
  eGameIDTeamDeathmatch: 4, // --u32(1) << 2,
  eGameIDArtefactHunt: 8, // --u32(1) << 3,
  eGameIDCaptureTheArtefact: 16, // --u32(1) << 4,
  eGameIDDominationZone: 32, // --u32(1) << 5,
  eGameIDTeamDominationZone: 64, // --u32(1) << 6,

  // -- backward compatibility
  GAME_ANY: 0,
  GAME_SINGLE: 1,
  GAME_DEATHMATCH: 2,
  GAME_CTF: 3,
  GAME_ASSAULT: 4,
  GAME_CS: 5,
  GAME_TEAMDEATHMATCH: 6,
  GAME_ARTEFACTHUNT: 7,

  // --script game types
  GAME_LASTSTANDING: 100,
  GAME_DUMMY: 255, // --max(unsigned8)
} as const;

/**
 * Possible game types supported by engine.
 */
export enum EGameType {
  SINGLE = "single",
  DEATH_MATCH = "deathmatch",
  TEAM_DEATH_MATCH = "teamdeathmatch",
  ARTEFACT_HUNT = "artefacthunt",
  CAPTURE_THE_ARTEFACT = "capturetheartefact",
}
