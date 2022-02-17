/**
 * Query for WebXR support. If there's no support for the `immersive-ar` mode,
 * show an error.
 */
(async function() {
  const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
  if (isArSessionSupported) {
    document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
  } else {
    onNoXRDevice();
  }
})();



// Change this to your experience's glb file
var glbFilePath = '../assets/PsycheToScale.glb';
// Change these to your model's animation keyframes
var stops = [60/24, 115/24, 160/24];
// these are the titles of your modal panels, in order.
var titles = ["THE SPACECRAFT", "MULTISPECTRAL IMAGER", "MAGNETOMETER"/*, "SPECTOMETER", "X-BAND TELECOMMUNICATIONS", "DSOC", "PROPULSION SYSTEM"*/];
// descriptions of modal panels in order
var descriptions =
  [
    "The Psyche spacecraft is built by Maxar technologies, and will contain various scientific instruments to help in its mission.",
    "The bus or \"body\" of the spacecraft is slightly bigger than a Smart Car and about as tall as a regulation basketball hoop.",
    "The Psyche spacecraft (including the solar panels) is about the size of a singles tennis court."/*,
    "The bus or \"body\" of the spacecraft is slightly bigger than a Smart Car and about as tall as a regulation basketball hoop.",
    "The Psyche spacecraft (including the solar panels) is about the size of a singles tennis court.",
    "The bus or \"body\" of the spacecraft is slightly bigger than a Smart Car and about as tall as a regulation basketball hoop.",
    "The Psyche spacecraft (including the solar panels) is about the size of a singles tennis court.*/"
  ];
// set this to the entire length of your animation
var animationLength = 160/24;

var modalStatus = 0;
var modalClicked = 0;
DemoUtils.setAnimationLength(animationLength);
var animationIndex = 0;

const helpDiv = document.getElementById('help');

const modal = document.getElementById("modal2");
modal.onclick = function(){
  console.log("modal clicked.");
  modalClicked = 1;
}

const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
modalTitle.innerHTML = titles[0];
modalDescription.innerHTML = descriptions[0];

const recenterButton = document.getElementById("recenter");
recenterButton.onclick = function(){
  console.log("recenter attempt");
  modalClicked = 1;
  window.app.recenter();
}

const viewButton = document.getElementById("ViewButton");
viewButton.onclick = function(){
  console.log("View");
  helpDiv.classList.remove('fade-out');
  helpDiv.classList.add('fade-in');
  closeModal();
};
const nextButton = document.getElementById("NextButton");
nextButton.onclick = function(){
  console.log("Next");
  closeModal();

  DemoUtils.setNextTimeStop(stops[animationIndex]);
  animationIndex++;
  // if at the end of the animation, show finish button
  if(animationIndex == stops.length - 1){
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

  DemoUtils.resumeAnimation();

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

let gl = null;
let renderer = null;


console.log("Setup complete");

function openModal(){
  console.log("open modal");
  modalTitle.innerHTML = titles[animationIndex];
  modalDescription.innerHTML = descriptions[animationIndex];
  modal.classList.remove("out");
  modal.classList.add("one");
  modal.style.display = "Block";
  // -1 means modal is animating
  modalStatus = -1;
  setTimeout(function() { modalStatus = 1; }, 1000);
}

function closeModal(){
  console.log("close modal");
  modalClicked = 1;
  modal.classList.add("out");
  modalStatus = -1;
  setTimeout(function() { modalStatus = 0;modalClicked = 0; }, 1000);
}

/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class App {
  /**
   * Run when the Start AR button is pressed.
   */
  activateXR = async () => {
    console.log("activate xr");
    try {
      // Initialize a WebXR session using "immersive-ar".
      this.xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });

      // Create the canvas that will contain our camera's background and our virtual scene.
      this.createXRCanvas();

      // With everything set up, start the app.
      await this.onSessionStarted();
    } catch(e) {
      console.log(e);
      onNoXRDevice();
    }
  }

  /**
   * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
   */
  createXRCanvas() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl", {xrCompatible: true});

    this.xrSession.updateRenderState({
      baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
    });
  }

  /**
   * Called when the XRSession has begun. Here we set up our three.js
   * renderer, scene, and camera and attach our XRWebGLLayer to the
   * XRSession and kick off the render loop.
   */
  onSessionStarted = async () => {
    // Add the `ar` class to our body, which will hide our 2D components
    document.body.classList.add('ar');

    // To help with working with 3D on the web, we'll use three.js.
    this.setupThreeJs();

    // Setup an XRReferenceSpace using the "local" coordinate system.
    this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');

    // Create another XRReferenceSpace that has the viewer as the origin.
    this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.
    this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

    // Start a rendering loop using this.onXRFrame.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    this.xrSession.addEventListener("select", this.onSelect);

    this.numTaps = 0;


  }

  recenter = () => {
    console.log("recentering");
    if(window.rover){
      window.rover.position.copy(this.reticle.position);
    }

  }

  onSelect = () => {
    this.numTaps += 1;

    //DemoUtils.resumeAnimation();

    console.log(this.numTaps);
    //console.log("modalStatus:"+modalStatus);

    // ignore clicks on the modal
    if(modalClicked == 1){
      modalClicked = 0;
      return;
    }

    // if modal is open, but user clicks the background, we hide the modal
    if(modalStatus == 1){
      console.log("modal present, but not clicked");
      helpDiv.classList.remove('fade-out');
      helpDiv.classList.add('fade-in');
      closeModal();
      return;
    }

    // if the user is in view mode and clicks, show the modal so they can continue the experience
    if(modalStatus == 0 && DemoUtils.getTimescale() == 0){
      helpDiv.classList.remove('fade-in');
      helpDiv.classList.add('fade-out');
      openModal();
    }

  }

  /**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
  onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    // Bind the graphics framebuffer to the baseLayer's framebuffer.
    const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.renderer.setFramebuffer(framebuffer);

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(this.localReferenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];

      const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
      this.renderer.setSize(viewport.width, viewport.height)

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      this.camera.matrix.fromArray(view.transform.matrix)
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);
      this.camera.updateMatrixWorld(true);

      // Conduct hit test.
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);

      // If we have results, consider the environment stabilized.
      if (!this.stabilized && hitTestResults.length > 0) {
        this.stabilized = true;
        document.body.classList.add('stabilized');
        if (window.rover) {
          const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);
          // place 3d model once we are stabilized
          //const clone = window.rover.clone();
          modal.style.display = "block";
          modalStatus = 1;
          const clone = window.rover;
          clone.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          this.scene.add(clone)

          const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
          shadowMesh.position.y = clone.position.y;
          DemoUtils.resumeAnimation();

        }
      }
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);

        // Update the reticle position
        this.reticle.visible = false;
        this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
        this.reticle.updateMatrixWorld(true);
      }

      if(window.rover){
        const rover = window.rover;
        rover.rotation.set(rover.rotation.x, rover.rotation.y + 0.01, rover.rotation.z);
      }

      // Render the scene with THREE.WebGLRenderer.
      this.renderer.render(this.scene, this.camera)
    }
  }



  /**
   * Initialize three.js specific rendering code, including a WebGLRenderer,
   * a demo scene, and a camera for viewing the 3D content.
   */
  setupThreeJs() {
    // To help with working with 3D on the web, we'll use three.js.
    // Set up the WebGLRenderer, which handles rendering to our session's base layer.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.gl
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize our demo scene.
    this.scene = DemoUtils.createLitScene();
    this.reticle = new Reticle();
    this.scene.add(this.reticle);

    // We'll update the camera matrices directly from API, so
    // disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    this.camera = new THREE.PerspectiveCamera();
    this.camera.matrixAutoUpdate = false;
  }
};

window.app = new App();
console.log("app created");
