
//
// Engine script loader
//

function include(url) {
  
  var sc = document.createElement('script');
  sc.src = url;
  document.head.appendChild(sc);
}
    

include('Foundation/jquery-3.2.0/jquery.min.js');
include('Foundation/bootstrap-3.3.7-dist/js/bootstrap.min.js');
include('Foundation/poly-decomp.js-4558762/build/decomp.min.js');
include('Foundation/matter_js/matter.min.js');
include('Foundation/gl-matrix/gl-matrix-min.js');

include('track_editor_foundation/metlib.js');
include('track_editor_foundation/region.js');
include('track_editor_foundation/graph.js');


/*
include('engine/system.js');
include('engine/util.js');
include('engine/clock.js');
include('engine/sprite.js');
include('engine/SpriteSheet.js');
include('engine/AnimationSequence.js');
include('engine/player.js');
include('engine/projectile.js');
include('engine/pickups.js');
include('engine/background.js');
include('engine/player_states.js');
include('config.js');
include('engine/stages/game_stage.js');
include('engine/characters/character_ufo.js');
include('engine/CollisionModel.js');
*/
