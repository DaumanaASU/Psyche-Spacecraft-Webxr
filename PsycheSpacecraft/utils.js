window.gltfLoader = new THREE.GLTFLoader();

class Reticle extends THREE.Object3D {
  constructor() {
    super();

    this.loader = new THREE.GLTFLoader();
    this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
      this.add(gltf.scene);
    })

    this.visible = false;
  }
}

const clock = new THREE.Clock();
animationLength = 9999;


window.gltfLoader.load("https://immersive-web.github.io/webxr-samples/media/gltf/sunflower/sunflower.gltf", function(gltf) {
  const flower = gltf.scene.children.find(c => c.name === 'sunflower')
  flower.castShadow = true;
  window.sunflower = gltf.scene;
});

window.gltfLoader.setPath( '../assets/');
window.gltfLoader.load( 'PsycheToScale.glb', function (gltf){

  gltf.scene.traverse( function ( child ) {

    if ( child.isMesh ) {

      const rover = child;
      rover.castShadow = true;
      window.rover = gltf.scene;

      animationTime = 0;
      nextTimeStop = 20/24;
      

      mixer = new THREE.AnimationMixer(gltf.scene);
      mixer.clipAction(gltf.animations[0]).play();
      mixer.timeScale = 0;
      animate();
      
    }

  } );

});




function animate() {

  requestAnimationFrame( animate );

  const delta = clock.getDelta();

  mixer.update( delta );


  if(mixer.timeScale == 1){
    if(animationTime == null){
      animationTime = 0;
    }
    if(animationTime > animationLength){
      animationTime = 0;
      mixer.setTime(0);
    }
    animationTime += delta;
  }

  if(animationTime > nextTimeStop){
    mixer.timeScale = 0;
    
  }

}

window.DemoUtils = {
  /**
   * Creates a THREE.Scene containing lights that case shadows,
   * and a mesh that will receive shadows.
   *
   * @return {THREE.Scene}
   */
  createLitScene() {
    const scene = new THREE.Scene();

    // The materials will render as a black mesh
    // without lights in our scenes. Let's add an ambient light
    // so our material can be visible, as well as a directional light
    // for the shadow.
    const light = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);

    // We want this light to cast shadow.
    directionalLight.castShadow = true;

    // Make a large plane to receive our shadows
    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    // Rotate our plane to be parallel to the floor
    planeGeometry.rotateX(-Math.PI / 2);

    // Create a mesh with a shadow material, resulting in a mesh
    // that only renders shadows once we flip the `receiveShadow` property.
    const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
      color: 0x111111,
      opacity: 0.2,
    }));

    // Give it a name so we can reference it later, and set `receiveShadow`
    // to true so that it can render our model's shadow.
    shadowMesh.name = 'shadowMesh';
    shadowMesh.receiveShadow = true;
    shadowMesh.position.y = 10000;

    // Add lights and shadow material to scene.
    scene.add(shadowMesh);
    scene.add(light);
    scene.add(directionalLight);

    return scene;
  },

  /**
   * Creates a THREE.Scene containing cubes all over the scene.
   *
   * @return {THREE.Scene}
   */
  createCubeScene() {
    const scene = new THREE.Scene();

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
      new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      new THREE.MeshBasicMaterial({ color: 0xff00ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ffff }),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    ];

    const ROW_COUNT = 4;
    const SPREAD = 1;
    const HALF = ROW_COUNT / 2;
    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < ROW_COUNT; j++) {
        for (let k = 0; k < ROW_COUNT; k++) {
          const box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), materials);
          box.position.set(i - HALF, j - HALF, k - HALF);
          box.position.multiplyScalar(SPREAD);
          scene.add(box);
        }
      }
    }

    return scene;
  },
  stopAnimation(){
    mixer.timeScale = 0
    
  },
  
  resumeAnimation(){
    console.log("Resuming animation");
    console.log("Animation Time: "+animationTime + " Next Stop: "+nextTimeStop + " Total Length: "+animationLength);
    mixer.timeScale = 1
  },
  setNextTimeStop(timeStop){
    console.log("setting next timestop to:"+timeStop);
    nextTimeStop = timeStop;
  },
  setAnimationLength(length){
    animationLength = length;
  },
  getTimescale(){
    return mixer.timeScale;
  }
};

/**
 * Toggle on a class on the page to disable the "Enter AR"
 * button and display the unsupported browser message.
 */
function onNoXRDevice() {
  console.log("No xr device");
  document.body.classList.add('unsupported');
  
}