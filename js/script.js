// Three.js and webvr setup
//TODO: refactor

// const Perlin = require("./PerlinNoise.js");

//  Does this browser support the WebVR API?
//  Here’s how to download and configure one that does:
//  https://webvr.rocks
WEBVR.checkAvailability().catch( function( message ){

	document.body.appendChild( WEBVR.getMessageContainer( message ))
})

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.target = new THREE.Vector3(0, 0, 0);
camera.lookAt(camera.target);

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.vr.enabled  = true;
// renderer.vr.standing = true;

// Used for Perlin Noise
var date = new Date();
var pn = new ClassicalNoise( "rnd" + date.getTime());

//  Move camera around world
controls = new THREE.VRControls(camera);
// controls = new THREE.OrbitControls(camera);
controls.standing = true;
camera.position.y = controls.userHeight;
var vrControls = new THREE.VRControls(camera);

var stars = [];
var floor = [];

// Create the shape
// var geometry = new THREE.BoxGeometry(1, 1, 1 );
// var cubeMaterials = [
// 	new THREE.MeshPhongMaterial({ color: 0xFF0000, side: THREE.FrontSide }),
// 	new THREE.MeshPhongMaterial({ color: 0xc0c0c0, side: THREE.FrontSide }),
// 	new THREE.MeshPhongMaterial({ color: 0x0F0F0F, side: THREE.FrontSide }),
// 	new THREE.MeshPhongMaterial({ color: 0x00FF00, side: THREE.FrontSide }),
// 	new THREE.MeshPhongMaterial({ color: 0x232323, side: THREE.FrontSide }),
// 	new THREE.MeshPhongMaterial({ color: 0x0000FF, side: THREE.FrontSide }),
// ];
// var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
// var cube = new THREE.Mesh( geometry, cubeMaterial);
// cube.position.set(0, 0, -3);
// scene.add( cube );

//  360 image-
// var sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
// var texture = new THREE.TextureLoader().load('img/day-front.jpg');
// var sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
// var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial);
// cube.position.set(0, 0, -3);
// scene.add( sphere );


//VREffect3
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera.position.z = 4;

var options = {
  color: 'black',
  background: 'white',
  corners: 'square'
};

var enterVRButton = new webvrui.EnterVRButton(renderer.domElement, options);
enterVRButton.on('exit', function() {
  camera.quaternion.set(0, 0, 0, 1);
  camera.position.set(0, vrControls.userHeight, 0);
});
enterVRButton.on('hide', function() {
  document.getElementById('ui').style.display = 'none';
});
enterVRButton.on('show', function() {
	controls = new THREE.VRControls(camera);
	controls.standing = true;
	camera.position.y = controls.userHeight;
  document.getElementById('ui').style.display = 'inherit';
});
document.getElementById('vr-button').appendChild(enterVRButton.domElement);
document.getElementById('no-vr').addEventListener('click', function() {
  enterVRButton.requestEnterFullscreen();
  controls = new THREE.OrbitControls( camera, renderer.domElement);
});


//ambient light
// var ambientLight = new THREE.AmbientLight(0xFFFFFF,  1.0);
// scene.add( ambientLight );
// //point light
// var light1 = new THREE.PointLight(0xFF0040, 7, 50);
// scene.add(light1);
// var light2 = new THREE.PointLight(0x0040FF, 4, 50);
// scene.add(light2);
// var light3 = new THREE.PointLight(0x80FF80, 7, 50);
// scene.add(light3);
//directional light
// var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 5 );
// directionalLight.position.set(1, 1, 0);
// scene.add(directionalLight);
//spotlight
// var spotlight = new THREE.SpotLight(0xFFFFFF, 5);
// spotlight.position.set(0, 1, 0);
// scene.add(spotlight);

var interacting;
var pointerX = 0;
var pointerY = 0;
var lat = 0;
var lng = 0;
var savedLat = 0;
var savedLng = 0;

addLight();
addStars();
addGround();
animate();

function addLight(){
 
  //use directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9);
  //set the position
  directionalLight.position.set(5, 4, 5);
  //enable shadow
  directionalLight.castShadow = true;
  //enable camera
  directionalLight.shadowCameraVisible = true;
 
  //add light to the scene
  scene.add( directionalLight );
}

function animateStars() {
             
    // loop through each star
    for(var i=0; i<stars.length; i++) {
         
        star = stars[i];
             
        // move it forward by a 10th of its array position each time
        star.position.z +=  i/10;
             
        // once the star is too close, reset its z position
        if(star.position.z>1000) star.position.z-=2000; 
    }
}

function addStars(){
    // Create a sphere to make visualization easier.
   for ( var z= -1000; z < 1000; z+=20 ) {

        // Make a sphere (exactly the same as before).
        var geometry   = new THREE.SphereGeometry(0.5, 32, 32)
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
        var sphere = new THREE.Mesh(geometry, material)

        // This time we give the sphere random x and y positions between -500 and 500
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;

        // Then set the z position to where it is in the loop (distance of camera)
        sphere.position.z = z;

        // scale it up a bit
        sphere.scale.x = sphere.scale.y = 2;

        //add the sphere to the scene
        scene.add( sphere );

        //finally push it to the stars array
        stars.push(sphere);
    }
}

function addGround() {
 
  //create the ground material using Mesh Basic Material
   for ( var z= 0; z < 1600; z+=800 ) {
   
        //create the ground material using MeshLambert Material
        var groundMat = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide}  );
 
        //create the plane geometry
        var geometry = new THREE.PlaneGeometry(240,800,300,300);
 
        //make the terrain bumpy
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
          var vertex = geometry.vertices[i];
          var value = pn.noise(vertex.x / 10, vertex.y /10, 0);
          vertex.z = value *6;
        }
 
        //ensure light is computed correctly
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
 
        //create the ground form the geometry and material
        var ground = new THREE.Mesh(geometry,groundMat);
        //rotate 90 degrees around the xaxis so we can see the terrain
        ground.rotation.x = -Math.PI/-2;
 
        // Then set the z position to where it is in the loop (distance of camera)
        ground.position.z = z;
        ground.position.y -=4;
 
        //add the ground to the scene
        scene.add(ground);
        //finally push it to the stars array
        floor.push(ground);
     }
}

function moveWithCamera(camera){
	// loop through each of the 3 floors
	for(var i=0; i<this.floor.length; i++) {
	   
	  //if the camera has moved past the entire square, move the square
	  if((this.floor[i].position.z - 100)>camera.position.z){
	     
	    this.floor[i].position.z-=200;
	}
    
}

//VRController connectivity
window.addEventListener( 'vr controller connected', function( event ){
	//  Here it is, your VR controller instance.
	//  It’s really a THREE.Object3D so you can just add it to your scene:
	var controller = event.detail
	scene.add( controller )
	//  HEY HEY HEY! This is important. You need to make sure you do this.
	//  For standing experiences (not seated) we need to set the standingMatrix
	//  otherwise you’ll wonder why your controller appears on the floor
	//  instead of in your hands! And for seated experiences this will have no
	//  effect, so safe to do either way:
	controller.standingMatrix = renderer.vr.getStandingMatrix()
	//  And for 3DOF (seated) controllers you need to set the controller.head
	//  to reference your camera. That way we can make an educated guess where
	//  your hand ought to appear based on the camera’s rotation.
	controller.head = window.camera
	//  Right now your controller has no visual.
	//  It’s just an empty THREE.Object3D.
	//  Let’s fix that!
	var
	meshColorOff = 0xDB3236,//  Red.
	meshColorOn  = 0xF4C20D,//  Yellow.
	controllerMaterial = new THREE.MeshStandardMaterial({

		color: meshColorOff
	}),
	controllerMesh = new THREE.Mesh(

		new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
		controllerMaterial
	),
	handleMesh = new THREE.Mesh(

		new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
		controllerMaterial
	)

	controllerMaterial.flatShading = true
	controllerMesh.rotation.x = -Math.PI / 2
	handleMesh.position.y = -0.05
	controllerMesh.add( handleMesh )
	controller.userData.mesh = controllerMesh//  So we can change the color later.
	controller.add( controllerMesh )
	castShadows( controller )
	receiveShadows( controller )
	//  Allow this controller to interact with DAT GUI.
	var guiInputHelper = dat.GUIVR.addInputObject( controller )
	scene.add( guiInputHelper )
	//  Button events. How easy is this?!
	//  We’ll just use the “primary” button -- whatever that might be ;)
	//  Check out the THREE.VRController.supported{} object to see
	//  all the named buttons we’ve already mapped for you!
	controller.addEventListener( 'primary press began', function( event ){
		event.target.userData.mesh.material.color.setHex( meshColorOn )
		guiInputHelper.pressed( true )
	})
	controller.addEventListener( 'primary press ended', function( event ){
		event.target.userData.mesh.material.color.setHex( meshColorOff )
		guiInputHelper.pressed( false )
	})
	controller.addEventListener( 'disconnected', function( event ){
		controller.parent.remove( controller )
	})
})


function animate() {
	animateStars();

	// for(var i=0; i<floor.length; i++) {
     
 //    	ground = floor[i];
	       
	//     // move it forward by a 10th of its array position each time
	//     ground.position.z +=  0.5;
	       
	//     // once the star is too close, reset its z position
	//     if(ground.position.z>400) ground.position.z-=1600;  
	// }

	//  Here’s VRController’s UPDATE goods right here:
	//  This one command in your animation loop is going to handle
	//  all the VR controller business you need to get done!
	if(THREE.VRController != undefined){
		THREE.VRController.update();
	}
		

	 effect.render(scene, camera);

	 if (enterVRButton.isPresenting()) {
	    controls.update();
	     // orbitControls.update();
	  	// vrControls.update();
	 
	}

  	requestAnimationFrame(animate);
  	// update();	
}

renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('resize', onResize, false);

function onMouseDown(event) {
  event.preventDefault();
  interacting = true;
  pointerX = event.clientX;
  pointerY = event.clientY;
  savedLng = lng;
  savedLat = lat;
}

function onMouseMove(event) {
  if (interacting) {
    lng = ( pointerX - event.clientX ) * 0.1 + savedLng;
    lat = ( pointerY - event.clientY ) * 0.1 + savedLat;
  }
}

function onMouseUp(event) {
  event.preventDefault();
  interacting = false;
}

function onTouchDown(event) {
  event.preventDefault();
  interacting = true;
  pointerX = event.touches[0].clientX;
  pointerY = event.touches[0].clientY;
  savedLng = lng;
  savedLat = lat;
}

function onTouchMove(event) {
  if (interacting) {
    lng = ( pointerX - event.touches[0].clientX ) * 0.1 + savedLng;
    lat = ( pointerY - event.touches[0].clientY ) * 0.1 + savedLat;
  }
}

function onTouchEnd(event) {
  event.preventDefault();
  interacting = false;
}

function onResize() {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update(){
	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.005;

	var time = Date.now() * 0.0005;
	// light1.position.x = Math.sin(time * 0.7) * 30;
	// light1.position.y = Math.cos(time * 0.5) * 40;
	// light1.position.z = Math.cos(time * 0.3) * 30;

	// light2.position.x = Math.cos(time * 0.7) * 30;
	// light2.position.y = Math.sin(time * 0.5) * 40;
	// light2.position.z = Math.sin(time * 0.3) * 30;

	// light3.position.x = Math.sin(time * 0.7) * 30;
	// light3.position.y = Math.cos(time * 0.5) * 40;
	// light3.position.z = Math.sin(time * 0.3) * 30;
};
