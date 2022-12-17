export {};

declare global {
  /**
   C++ class CSnork : CGameObject {
    CSnork ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CSpaceRestrictor : CGameObject {
    CSpaceRestrictor ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CStalkerOutfit : CGameObject {
    CStalkerOutfit ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CTorch : CGameObject {
    CTorch ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CTorridZone : CGameObject {
    CTorridZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CZoneCampfire : CGameObject {
    CZoneCampfire ();

    function Visual() const;

    function getEnabled() const;

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function is_on();

    function turn_on();

    function turn_off();

    function net_Export(net_packet&);

    function _construct();

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CCar : CGameObject,holder {
    const eWpnActivate = 3;
    const eWpnAutoFire = 5;
    const eWpnDesiredDir = 1;
    const eWpnDesiredPos = 2;
    const eWpnFire = 4;
    const eWpnToDefaultDir = 6;

    CCar ();

    function _construct();

    function GetfHealth() const;

    function CurrentVel();

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function SetParam(number, vector);

    function net_Export(net_packet&);

    function Visual() const;

    function IsObjectVisible(game_object*);

    function SetExplodeTime(number);

    function net_Import(net_packet&);

    function HasWeapon();

    function SetfHealth(number);

    function engaged();

    function ExplodeTime();

    function FireDirDiff();

    function CarExplode();

    function CanHit();

    function getEnabled() const;

    function Action(number, number);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CGrenadeLauncher : CGameObject {
    CGrenadeLauncher ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CHelicopter : CGameObject {
    const eAlive = 0;
    const eBodyByPath = 0;
    const eBodyToPoint = 1;
    const eDead = 1;
    const eEnemyEntity = 2;
    const eEnemyNone = 0;
    const eEnemyPoint = 1;
    const eMovLanding = 4;
    const eMovNone = 0;
    const eMovPatrolPath = 2;
    const eMovRoundPath = 3;
    const eMovTakeOff = 5;
    const eMovToPoint = 1;

    property m_dead;
    property m_exploded;
    property m_flame_started;
    property m_light_started;
    property m_max_mgun_dist;
    property m_max_rocket_dist;
    property m_min_mgun_dist;
    property m_min_rocket_dist;
    property m_syncronize_rocket;
    property m_time_between_rocket_attack;
    property m_use_mgun_on_attack;
    property m_use_rocket_on_attack;

    CHelicopter ();

    function _construct();

    function SetSpeedInDestPoint(number);

    function getVisible() const;

    function LookAtPoint(vector, boolean);

    function GetRealAltitude();

    function GetCurrVelocity();

    function SetLinearAcc(number, number);

    function GoPatrolByPatrolPath(string, number);

    function GetSpeedInDestPoint(number);

    function isVisible(game_object*);

    function net_Import(net_packet&);

    function SetMaxVelocity(number);

    function SetfHealth(number);

    function GetMovementState();

    function SetEnemy(game_object*);
    function SetEnemy(vector*);

    function getEnabled() const;

    function GetfHealth() const;

    function Explode();

    function SetOnPointRangeDist(number);

    function SetFireTrailLength(number);

    function GetOnPointRangeDist();

    function GetMaxVelocity();

    function TurnLighting(boolean);

    function SetBarrelDirTolerance(number);

    function GetBodyState();

    function GetCurrVelocityVec();

    function net_Export(net_packet&);

    function SetDestPosition(vector*);

    function UseFireTrail();
    function UseFireTrail(boolean);

    function GoPatrolByRoundPath(vector, number, boolean);

    function net_Spawn(cse_abstract*);

    function GetState();

    function Die();

    function StartFlame();

    function Visual() const;

    function GetDistanceToDestPosition();

    function GetHuntState();

    function TurnEngineSound(boolean);

    function GetSafeAltitude();

    function ClearEnemy();

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CPda : CGameObject {
    CPda ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class CPhysicObject : CGameObject {
    CPhysicObject ();

    function set_door_ignore_dynamics();

    function _construct();

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function play_bones_sound();

    function run_anim_back();

    function net_Export(net_packet&);

    function Visual() const;

    function unset_door_ignore_dynamics();

    function net_Import(net_packet&);

    function run_anim_forward();

    function stop_anim();

    function anim_time_get();

    function getEnabled() const;

    function anim_time_set(number);

    function stop_bones_sound();

    function use(CGameObject*);

  };
   */

  // todo;

}
