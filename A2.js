/**
 * UBC CPSC 314 (2015W1)
 * Assignment 2
 */


// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}


// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(50,20,35);
camera.lookAt(scene.position);
scene.add(camera);


// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;


// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();


// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// UNIFORMS
var tvChannel = {type: 'i', value: 0};
var timeUniform = {type: 'f', value: 0};

// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();
var ostrichBodyMaterial = new THREE.ShaderMaterial({
   uniforms: {
	tvChannelU: tvChannel,
	timeUniform: timeUniform,
  },
});
var ostrichSkinMaterial = new THREE.ShaderMaterial();

// LOAD SHADERS
var shaderFiles = [
  'glsl/osbody.vs.glsl',
  'glsl/osbody.fs.glsl',
  'glsl/osskin.vs.glsl',
  'glsl/osskin.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  ostrichBodyMaterial.vertexShader = shaders['glsl/osbody.vs.glsl'];
  ostrichBodyMaterial.fragmentShader = shaders['glsl/osbody.fs.glsl'];
  ostrichSkinMaterial.vertexShader = shaders['glsl/osskin.vs.glsl'];
  ostrichSkinMaterial.fragmentShader = shaders['glsl/osskin.fs.glsl'];
})

// GEOMETRY
var torsoGeometry = new THREE.SphereGeometry(2.5, 64, 64); // centered on origin
for (var i = 0; i < torsoGeometry.vertices.length; i++)
{
  torsoGeometry.vertices[i].z *= 1.4;
}
var neckGeometry = new THREE.CylinderGeometry(.4, .4, 4.5, 32);
var headGeometry = new THREE.SphereGeometry(0.7, 32, 32);
for (var i = 0; i < headGeometry.vertices.length; i++)
{
  headGeometry.vertices[i].z *= 1.5;
}
var thighGeometry = new THREE.CylinderGeometry(.8, .3, 3, 32);
for (var i = 0; i < thighGeometry.vertices.length; i++)
{
  thighGeometry.vertices[i].y -= 1.5;
}
var lowerlegGeometry = new THREE.CylinderGeometry(.3, .25, 4, 32);
for (var i = 0; i < lowerlegGeometry.vertices.length; i++)
{
  lowerlegGeometry.vertices[i].y -= 2;
}


// MATRICES
var torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,7, 0,0,1,0, 0,0,0,1);
var neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
var necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, neckMatrix);
var headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
var headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, headMatrix);

//initialize matrices for legs here:
var leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
var leftthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
var leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));

var leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
var leftlowerlegrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
var leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

var rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
var rightthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
var rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));

var rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
var rightlowerlegrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
var rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));




// CREATE BODY
var torso = new THREE.Mesh(torsoGeometry, ostrichBodyMaterial);
torso.setMatrix(torsoMatrix)
scene.add(torso);

var neck = new THREE.Mesh(neckGeometry, ostrichSkinMaterial);
neck.setMatrix(necktorsoMatrix);
scene.add(neck);

var head = new THREE.Mesh(headGeometry, ostrichSkinMaterial);
head.setMatrix(headnecktorsoMatrix);
scene.add(head);

//create legs and add them to the scene here:
var leftthigh = new THREE.Mesh(thighGeometry, ostrichSkinMaterial);
leftthigh.setMatrix(leftthightorsoMatrix);
scene.add(leftthigh);

var leftlowerleg = new THREE.Mesh(lowerlegGeometry, ostrichSkinMaterial);
leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
scene.add(leftlowerleg);

var rightthigh = new THREE.Mesh(thighGeometry, ostrichSkinMaterial);
rightthigh.setMatrix(rightthightorsoMatrix);
scene.add(rightthigh);

var rightlowerleg = new THREE.Mesh(lowerlegGeometry, ostrichSkinMaterial);
rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
scene.add(rightlowerleg);

//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS
var clock = new THREE.Clock(true);
function updateBody() {

  switch(channel)
  {
    //animation
    case 0: 
      {
        var t = clock.getElapsedTime();
        timeUniform.value = t;

        //animate legs here:
        var upDownOscillation = Math.sin((t+ 0.70)*8) / 2;
        
        var llegModulation = (Math.sin(t*4) + 0.9)/1.8;
        var llowerlegMod = - (Math.sin((t+5.85)*4) + 0.9) * 1.1;
        var rlegModulation = ((- Math.sin(t*4)) + 0.9)/1.8;
        var rlowerlegMod = - (- Math.sin((t+5.85)*4) + 0.9) * 1.1;
        
        
        // recalculate all multiplied matrices if affected by animation
        // set translation oscillations, reset positions of other parts.
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,7 + upDownOscillation, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5 - upDownOscillation/4, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        
        var neckrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(upDownOscillation/3 + 0.3),- Math.sin(upDownOscillation/3 + 0.3),0, 0, Math.sin(upDownOscillation/3 + 0.3), Math.cos(upDownOscillation/3 + 0.3),0, 0,0,0,1);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.4, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-upDownOscillation/1.8 - 0.3),- Math.sin(-upDownOscillation/1.8 - 0.3),0, 0, Math.sin(-upDownOscillation/1.8 - 0.3), Math.cos(-upDownOscillation/1.8 - 0.3),0, 0,0,0,1);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        leftthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(llegModulation),- Math.sin(llegModulation),0, 0, Math.sin(llegModulation), Math.cos(llegModulation),(-llegModulation), 0,0,0,1);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(llowerlegMod),- Math.sin(llowerlegMod),0, 0, Math.sin(llowerlegMod), Math.cos(llowerlegMod),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

        rightthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(rlegModulation),- Math.sin(rlegModulation),0, 0, Math.sin(rlegModulation), Math.cos(rlegModulation),(-rlegModulation), 0,0,0,1);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(rlowerlegMod),- Math.sin(rlowerlegMod),0, 0, Math.sin(rlowerlegMod), Math.cos(rlowerlegMod),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        
        //set matrices for all affected parts
        
        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      }
      break;

    //add poses here:
    case 1:
      {
        // set base translations
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.2, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.6, 0,1,0,-0.8, 0,0,1,0.5, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.6, 0,1,0,-0.8, 0,0,1,0.5, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
      
        var torsorotMatrix = new THREE.Matrix4().set(Math.cos(-0.2),0,Math.sin(-0.2),0, 0,1,0,0, -Math.sin(-0.2),0,Math.cos(-0.2),0, 0,0,0,1);
        var truetorsoMatrix = necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, torsorotMatrix);
        
        var neckrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.7),- Math.sin(0.7),0, 0, Math.sin(0.7), Math.cos(0.7),0, 0,0,0,1);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.0, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.7),- Math.sin(-0.7),0, 0, Math.sin(-0.7), Math.cos(-0.7),0, 0,0,0,1);
        var headrotBMatrix = new THREE.Matrix4().set(Math.cos(0.5),0,Math.sin(0.5),0, 0,1,0,0, -Math.sin(0.5),0,Math.cos(0.5),0, 0,0,0,1);
        var headrotMatrix = new THREE.Matrix4().multiplyMatrices(headrotAMatrix, headrotBMatrix);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        var leftthighrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1.3),- Math.sin(1.3),0, 0, Math.sin(1.3), Math.cos(1.3),0, 0,0,0,1);
        var leftthighrotBMatrix = new THREE.Matrix4().set(Math.cos(-0.3),0,Math.sin(-0.3),0, 0,1,0,0, -Math.sin(-0.3),0,Math.cos(-0.3),0, 0,0,0,1);
        leftthighrotMatrix = new THREE.Matrix4().multiplyMatrices(leftthighrotBMatrix, leftthighrotAMatrix);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-2.5),- Math.sin(-2.5),0, 0, Math.sin(-2.5), Math.cos(-2.5),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));
        
        var rightthighrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1.3),- Math.sin(1.3),0, 0, Math.sin(1.3), Math.cos(1.3),0, 0,0,0,1);
        var rightthighrotBMatrix = new THREE.Matrix4().set(Math.cos(0.3),0,Math.sin(0.3),0, 0,1,0,0, -Math.sin(0.3),0,Math.cos(0.3),0, 0,0,0,1);
        rightthighrotMatrix = new THREE.Matrix4().multiplyMatrices(rightthighrotBMatrix, rightthighrotAMatrix);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-2.5),- Math.sin(-2.5),0, 0, Math.sin(-2.5), Math.cos(-2.5),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        
        torso.setMatrix(truetorsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      
      }
       break;

    case 2:
      {
       // set base translations
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,5.5, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        
        var torsorotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.3),- Math.sin(0.3),0, 0, Math.sin(0.3), Math.cos(0.3),0, 0,0,0,1);
        var truetorsoMatrix = necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, torsorotMatrix);
        
        var neckrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(2),- Math.sin(2),0, 0, Math.sin(2), Math.cos(2),0, 0,0,0,1);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.2, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.6),- Math.sin(-0.6),0, 0, Math.sin(-0.6), Math.cos(-0.6),0, 0,0,0,1);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        leftthighrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.6),- Math.sin(0.6),0, 0, Math.sin(0.6), Math.cos(0.6),0, 0,0,0,1);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-1.5),- Math.sin(-1.5),0, 0, Math.sin(-1.5), Math.cos(-1.5),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

        rightthighrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.6),- Math.sin(0.6),0, 0, Math.sin(0.6), Math.cos(0.6),0, 0,0,0,1);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-1.5),- Math.sin(-1.5),0, 0, Math.sin(-1.5), Math.cos(-1.5),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        
        torso.setMatrix(truetorsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      }
      break;

    case 3:
      {
        // set base translations
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,7, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
      
        var torsorotMatrix = new THREE.Matrix4().set(Math.cos(-0.3),-Math.sin(-0.3),0,0, Math.sin(-0.3),Math.cos(-0.3),0,0, 0,0,1,0, 0,0,0,1);
        var truetorsoMatrix = necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, torsorotMatrix);
        
        var neckrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.7),- Math.sin(0.7),0, 0, Math.sin(0.7), Math.cos(0.7),0, 0,0,0,1);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.0, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.7),- Math.sin(-0.7),0, 0, Math.sin(-0.7), Math.cos(-0.7),0, 0,0,0,1);
        var headrotBMatrix = new THREE.Matrix4().set(Math.cos(0.5),0,Math.sin(0.5),0, 0,1,0,0, -Math.sin(0.5),0,Math.cos(0.5),0, 0,0,0,1);
        var headrotMatrix = new THREE.Matrix4().multiplyMatrices(headrotAMatrix, headrotBMatrix);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        var leftthighrotAMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.5),- Math.sin(0.5),0, 0, Math.sin(0.5), Math.cos(0.5),0, 0,0,0,1);
        var leftthighrotBMatrix  = new THREE.Matrix4().set(Math.cos(0.3),-Math.sin(0.3),0,0, Math.sin(0.3),Math.cos(0.3),0,0, 0,0,1,0, 0,0,0,1);
        leftthighrotMatrix = new THREE.Matrix4().multiplyMatrices(leftthighrotAMatrix, leftthighrotBMatrix);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.3),- Math.sin(-0.3),0, 0, Math.sin(-0.3), Math.cos(-0.3),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

        rightthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1),- Math.sin(1),0, 0, Math.sin(1), Math.cos(1),0, 0,0,0,1);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-2),- Math.sin(-2),0, 0, Math.sin(-2), Math.cos(-2),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        
        torso.setMatrix(truetorsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      
      }
      break;

    case 4:
      {
        // set base positions
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,9, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        
        var neckrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.4),- Math.sin(0.4),0, 0, Math.sin(0.4), Math.cos(0.4),0, 0,0,0,1);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.0, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-2),- Math.sin(-2),0, 0, Math.sin(-2), Math.cos(-2),0, 0,0,0,1);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        leftthighrotMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.7),- Math.sin(-0.7),0, 0, Math.sin(-0.7), Math.cos(-0.7),0, 0,0,0,1);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.3),- Math.sin(-0.3),0, 0, Math.sin(-0.3), Math.cos(-0.3),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

        rightthighrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1),- Math.sin(1),0, 0, Math.sin(1), Math.cos(1),0, 0,0,0,1);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.1),- Math.sin(-0.1),0, 0, Math.sin(-0.1), Math.cos(-0.1),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        
        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      
      }
  
    break;

    case 5:
      {
        // set base translations
        torsoMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,1.55, 0,0,1,0, 0,0,0,1);
        neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
        headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
        leftthighMatrix  = new THREE.Matrix4().set(1,0,0,1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        leftlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
        rightthighMatrix  = new THREE.Matrix4().set(1,0,0,-1.1, 0,1,0,-1.3, 0,0,1,0.3, 0,0,0,1);
        rightlowerlegMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-2.6, 0,0,1,0, 0,0,0,1);
      
        var torsorotMatrix = new THREE.Matrix4().set(Math.cos(1),-Math.sin(1),0,0, Math.sin(1),Math.cos(1),0,0, 0,0,1,0, 0,0,0,1);
        var truetorsoMatrix = necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, torsorotMatrix);
        
        var neckrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1.9),- Math.sin(1.9),0, 0, Math.sin(1.9), Math.cos(1.9),0, 0,0,0,1);
        var neckrotBMatrix = new THREE.Matrix4().set(Math.cos(-0.3),-Math.sin(-0.3),0,0, Math.sin(-0.3),Math.cos(-0.3),0,0, 0,0,1,0, 0,0,0,1);
        var neckrotMatrix = new THREE.Matrix4().multiplyMatrices(neckrotBMatrix,neckrotAMatrix);
        var neckmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3.4, 0,0,1,0, 0,0,0,1);
        var neckmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.0, 0,0,1,0, 0,0,0,1);
        var neckrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(neckmove1Matrix,neckrotMatrix), neckmove2Matrix);
        
        necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(neckMatrix, neckrottrueMatrix));
        
        var headrotAMatrix = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.7),- Math.sin(-0.7),0, 0, Math.sin(-0.7), Math.cos(-0.7),0, 0,0,0,1);
        var headrotBMatrix = new THREE.Matrix4().set(Math.cos(0.5),0,Math.sin(0.5),0, 0,1,0,0, -Math.sin(0.5),0,Math.cos(0.5),0, 0,0,0,1);
        var headrotMatrix = new THREE.Matrix4().multiplyMatrices(headrotAMatrix, headrotBMatrix);
        var headmove1Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,-0.5, 0,0,0,1);
        var headmove2Matrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0, 0,0,1,0.5, 0,0,0,1);
        var headrottrueMatrix = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().multiplyMatrices(headmove1Matrix,headrotMatrix), headmove2Matrix);
        
        headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, new THREE.Matrix4().multiplyMatrices(headMatrix, headrottrueMatrix));
        
        var leftthighrotAMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(1),- Math.sin(1),0, 0, Math.sin(1), Math.cos(1),0, 0,0,0,1);
        var leftthighrotBMatrix  = new THREE.Matrix4().set(Math.cos(0),-Math.sin(0),0,0, Math.sin(0),Math.cos(0),0,0, 0,0,1,0, 0,0,0,1);
        leftthighrotMatrix = new THREE.Matrix4().multiplyMatrices(leftthighrotAMatrix, leftthighrotBMatrix);
        leftthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftthighMatrix, leftthighrotMatrix));
        
        leftlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-0.3),- Math.sin(-0.3),0, 0, Math.sin(-0.3), Math.cos(-0.3),0, 0,0,0,1);
        leftlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(leftthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(leftlowerlegMatrix, leftlowerlegrotMatrix));

        var rightthighrotAMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(0.85),- Math.sin(0.85),0, 0, Math.sin(0.85), Math.cos(0.85),0, 0,0,0,1);
        var rightthighrotBMatrix  = new THREE.Matrix4().set(Math.cos(0.35),-Math.sin(0.35),0,0, Math.sin(0.35),Math.cos(0.35),0,0, 0,0,1,0, 0,0,0,1);
        rightthighrotMatrix  = new THREE.Matrix4().multiplyMatrices(rightthighrotBMatrix, rightthighrotAMatrix);
        rightthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(truetorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightthighMatrix, rightthighrotMatrix));
        
        rightlowerlegrotMatrix  = new THREE.Matrix4().set(1,0,0,0, 0,Math.cos(-2),- Math.sin(-2),0, 0, Math.sin(-2), Math.cos(-2),0, 0,0,0,1);
        rightlowerlegthightorsoMatrix = rightlowerlegthightorsoMatrix = new THREE.Matrix4().multiplyMatrices(rightthightorsoMatrix, new THREE.Matrix4().multiplyMatrices(rightlowerlegMatrix, rightlowerlegrotMatrix));
        
        torso.setMatrix(truetorsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        
        leftthigh.setMatrix(leftthightorsoMatrix);
        leftlowerleg.setMatrix(leftlowerlegthightorsoMatrix);
        
        rightthigh.setMatrix(rightthightorsoMatrix);
        rightlowerleg.setMatrix(rightlowerlegthightorsoMatrix);
      
      }
      break;

    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var channel = 0;
function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      channel = i;
      tvChannel.value = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();

  ostrichBodyMaterial.needsUpdate = true;
  ostrichSkinMaterial.needsUpdate = true;
  
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();