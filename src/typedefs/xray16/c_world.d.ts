declare module "xray16" {
   /**
    * C++ class cover_point
    */
   export class XR_cover_point {
     private constructor();

     public level_vertex_id(): u32;
     public is_smart_cover(): boolean;
     public position(): XR_vector;
   }

   /**
    C++ class CDestroyablePhysicsObject : CGameObject {
     CDestroyablePhysicsObject ();

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
    * C++ class client_spawn_manager {
    * @customConstructor client_spawn_manager
    */
   export class XR_client_spawn_manager {
     public remove(number1: u16, number2: u16): void;
     public add(number1: u16, number2: u16, cb: () => void): void ;
     public add(number1: u16, number2: u16, cb: () => void, object: XR_object): void ;
   }
}
