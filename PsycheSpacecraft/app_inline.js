//import * as THREE from '../build/three.module.js';
import Stats from '../jsm/libs/stats.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { RoomEnvironment } from '../jsm/environments/RoomEnvironment.js';

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';

var animationTime = null;

// Change this to your experience's glb file
var glbFilePath = '../assets/spacecraft.glb';
// Change these to your model's animation keyframes
var stops = [30/30, 60/30, 90/30, 120/30, 150/30, 180/30, 210/30];
// these are the titles of your modal panels, in order.
var titles = ["THE SPACECRAFT", "MULTISPECTRAL IMAGER", "MAGNETOMETER", "SPECTROMETER", "X-BAND TELECOMMUNICATIONS", "DSOC", "PROPULSION SYSTEM"];
// descriptions of modal panels in order
var descriptions =
  [
    "The Psyche spacecraft is built by Maxar technologies, and will contain various scientific instruments to help in its mission.",
    "The Multispectral imager uses high resolution images together with filters to differentiate between metals and silicates that form the asteroid.",
    "The Magnetometer in the spacecraft will measure the remaining magnetic field on the asteroid to find more about its history and composition.",
    "The Gamma Ray and Neutron Spectrometer will be used to find the chemical elements in the surface of the asteroid, which can be used to learn about its formation.",
    "The X-Band radio telecommunication system will measure the gravitational field, which will give scientists an idea of the internal structure of the asteroid.",
    "The Deep Space Optical Communication (DSOC) is a new technology being tested on this mission which should allow information to be transmitted via light particles in the form of a laser sent from the spacecraft to a telescope located in California.",
    "The Psyche spacecraft will be utilize solar energy gathered by its panels to power four SPT-140 engines which use electricity to convert xenon gas into xenon ions in order to create thrust."
  ];
// set this to the entire length of your animation
var animationLength = 210/30;


setAnimationLength(animationLength);
var animationIndex = 0;
var modalStatus = 0;
var modalClicked = 0;

const modal = document.getElementById("modal2");

const helpDiv = document.getElementById('help');


const container = document.getElementById('container');
container.onclick = function(){
  console.log("clicked");
  numTaps += 1;

  if(modalStatus == 1){
    console.log("modal present, but not clicked");
    // simulate view button press
    if(helpDiv){
      helpDiv.classList.remove('fade-out');
      helpDiv.classList.add('fade-in');
    }
    closeModal();
    return;
  }


  if(modalStatus == 0 && mixer.timeScale == 0){
    console.log(modalStatus);
    if(helpDiv){
      helpDiv.classList.remove('fade-in');
      helpDiv.classList.add('fade-out');
    }
    
    openModal();

    console.log(modalStatus);
  }
}



const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
modalTitle.innerHTML = titles[0];
modalDescription.innerHTML = descriptions[0];

const viewButton = document.getElementById("ViewButton");
viewButton.onclick = function(){
  console.log("View");
  if(helpDiv){
    helpDiv.classList.remove('fade-out');
    helpDiv.classList.add('fade-in');
  }
  
  closeModal();
};
const nextButton = document.getElementById("NextButton");
nextButton.onclick = function(){
  console.log("Next");
  closeModal();

  setNextTimeStop(stops[animationIndex]);
  animationIndex++;
  // if at the end of the animation, show finish button
  if(animationIndex == stops.length - 1){
    //nextButton.innerHTML = "Finish"
    setTimeout(function() { nextButton.innerHTML = "Finish" }, 1000);
    nextButton.onclick = function(){
      // on finish, takes to the Psyche webpage.
      // we can change this to take us to our own webpage if we want
      window.open("https://psyche.asu.edu/");
    }
  }
  if(animationIndex >= stops.length){
    nextButton.innerHTML = "Next"
    animationIndex = 0;
  }
  resumeAnimation();

  var endTime = stops[animationIndex];
  var beginningTime = 0;
  if(animationIndex != 0){
    beginningTime = stops[animationIndex - 1];
  }
  else{
    beginningTime = stops[animationIndex];
    endTime = animationLength;
    if(beginningTime == endTime){
      // need to account for end of animation, not sure if we want to just end the experience or loop through yet.
      beginningTime = 0;
      endTime = 1;

    }
  }
  
  var modalTime = endTime - beginningTime;
  console.log(modalTime+ " = "+endTime+" - "+beginningTime);
  setTimeout(function() { openModal(); }, modalTime * 1000);
  
  modalStatus = 0;
  modalStatus = -1;
  modalClicked = 1;
};

function openModal(){
  console.log("open modal");
  modalTitle.innerHTML = titles[animationIndex];
  modalDescription.innerHTML = descriptions[animationIndex];
  modal.classList.remove("out");
  modal.classList.add("one");
  modal.style.display = "Block";
  // -1 means modal is animating
  modalStatus = -1;
  //helpDiv.classList.remove('fade-in');
  //helpDiv.classList.add('fade-out');
  setTimeout(function() { modalStatus = 1; }, 1000);
}

function closeModal(){
  console.log("close modal");
  modalClicked = 1;
  modal.classList.add("out");
  modalStatus = -1;
  //helpDiv.classList.remove('fade-out');
  //helpDiv.classList.add('fade-in');
  setTimeout(function() { modalStatus = 0; }, 1000);
}

var numTaps = 0;

let mixer;

const clock = new THREE.Clock();
//const container = document.getElementById('container');

const loadingManager = new THREE.LoadingManager( () => {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.classList.remove('fade-out');
  loadingScreen.addEventListener('webkitTransitionEnd',onTransitionEnd);
  loadingScreen.addEventListener('transitionend',onTransitionEnd);
});

const stats = new Stats();
//container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( {antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
container.append(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
//scene.background = new THREE.Color( 0xbfe3dd );
// SKYBOX
scene.background = new THREE.CubeTextureLoader()
  .setPath( '../assets/skybox/')
  .load( [
    'Space+X.png',
    'Space-X.png',
    'Space+Y.png',
    'Space-Y.png',
    'Space+Z.png',
    'Space-Z.png',
  ] );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

/*
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(-5, -5,-5);
scene.add(directionalLight2);
*/


const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
camera.position.set( 5, 2, 8 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '../js/libs/draco/gltf/' );

const loader = new GLTFLoader( loadingManager );
loader.setDRACOLoader( dracoLoader );
// GLTF / GLB FILE
loader.load( glbFilePath, function ( gltf ) {

  const model = gltf.scene;
  model.position.set( 0, 0, 0 );
  model.scale.set( 4, 4, 4 );
  scene.add( model );
  model.traverse(function(obj) { obj.frustumCulled = false; });
  mixer = new THREE.AnimationMixer( model );
  mixer.clipAction( gltf.animations[ 0 ] ).play();
  mixer.timeScale = 0;
  openModal();

  animate();

}, undefined, function ( e ) {

  console.error( e );

} );

window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

};

function animate() {

  requestAnimationFrame( animate );

  const delta = clock.getDelta();

  mixer.update( delta );

  controls.update();

  stats.update();

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

  renderer.render( scene, camera );

}

function stopAnimation(){
  mixer.timeScale = 0
  
}

function resumeAnimation(){
  console.log("Resuming animation");
  console.log("Animation Time: "+animationTime + " Next Stop: "+nextTimeStop + " Total Length: "+animationLength);
  mixer.timeScale = 1
}
function setNextTimeStop(timeStop){
  console.log("setting next timestop to:"+timeStop);
  nextTimeStop = timeStop;
}
function setAnimationLength(length){
  animationLength = length;
}

function onTransitionEnd(event){
  event.target.remove();
}
