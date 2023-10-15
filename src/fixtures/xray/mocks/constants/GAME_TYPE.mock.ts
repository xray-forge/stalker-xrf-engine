export class MockGameType {
  public static eGameIDArtefactHunt: number = 8;
  public static eGameIDCaptureTheArtefact: number = 16;
  public static eGameIDDeathmatch: number = 2;
  public static eGameIDTeamDeathmatch: number = 4;

  public static GAME_UNKNOWN: number = -1;
  public static GAME_ANY: number = 0;
  public static GAME_SINGLE: number = 1;
  public static GAME_DEATHMATCH: number = 2;
  // GAME_CTF							= 3,
  // GAME_ASSAULT						= 4,	// Team1 - assaulting, Team0 - Defending
  public static GAME_CS: number = 5;
  public static GAME_TEAMDEATHMATCH: number = 6;
  public static GAME_ARTEFACTHUNT: number = 7;
  public static GAME_CAPTURETHEARTEFACT: number = 8;

  // identifiers in range [100...254] are registered for script game type
  public static GAME_DUMMY: number = 255; // temporary g
}
