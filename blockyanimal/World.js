// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if      (u_whichTexture == -2) { gl_FragColor = u_FragColor; }
    else if (u_whichTexture == -1) { gl_FragColor = vec4(v_UV, 1.0, 1.0); }
    else if (u_whichTexture ==  0) { gl_FragColor = texture2D(u_Sampler0, v_UV); }
    else if (u_whichTexture ==  1) { gl_FragColor = texture2D(u_Sampler1, v_UV); }
    else if (u_whichTexture ==  2) { gl_FragColor = texture2D(u_Sampler2, v_UV); }
    else                           { gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0); }
  }`;

// Global Variables
let canvas, gl;
let a_Position, a_UV;
let u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_whichTexture;

// WebGL setup and shader variable initialization
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.'); return;
  }
  a_Position        = gl.getAttribLocation (gl.program, 'a_Position');
  a_UV              = gl.getAttribLocation (gl.program, 'a_UV');
  u_FragColor       = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix     = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ViewMatrix      = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix= gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_Sampler0        = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1        = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2        = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_whichTexture    = gl.getUniformLocation(gl.program, 'u_whichTexture'); 
}

// Animal/Animation
// Globals related to UI elements;
let g_globalAngle = 180;
let g_globalAngleX = 0;

// Slider values
let g_legAngle = 0;
let g_bottomNeck = 0;
let g_topNeck = 0;
let g_tailAngle = 0;

// Animation toggles
let g_walkAnimation = false;
let g_idleAnimation = false;

// Mouse tracking
let g_mouseLastX = -1;
let g_mouseLastY = -1;

// UI Wiring
var g_camera;

function addActionsForHtmlUI() {
  const aOn  = document.getElementById('animationOnButton');
  const aOff = document.getElementById('animationOffButton');
  if (aOn)  aOn.onclick  = () => { g_animation = true;  };
  if (aOff) aOff.onclick = () => { g_animation = false; };
}

// Textures
function initTextures() {
  var skyImage = new Image();  // Create the image object
  if (!skyImage) {
    console.log('Failed to create the sky image object');
    return false;
  }
  skyImage.onload = function(){ sendImageToTexture(skyImage, 0, u_Sampler0); };
  skyImage.src = 'sky.jpg';

  var dirtImage = new Image();
  if (!dirtImage) {
    console.log('Failed to create the dirt image object');
    return false;
  }
  dirtImage.onload = function(){ sendImageToTexture(dirtImage, 1, u_Sampler1); };
  dirtImage.src = 'dirt.jpg';

  var giraffeImage = new Image();
  if (!giraffeImage) {
    console.log('Failed to create the giraffe image object');
    return false;
  }
  giraffeImage.onload = function(){ sendImageToTexture(giraffeImage, 2, u_Sampler2); };
  giraffeImage.src = 'giraffe.jpg';

  return true;
}

function sendImageToTexture(image, unit, sampler) {
  const tex = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(sampler, unit);
}
 
// Poke animation
let g_poke = false;
let g_pokeStartTime = 0;

function addActionsForHtmlUI() {
  // Button events
  document.getElementById('animationWalkOnButton').onclick = () => { g_walkAnimation = true;  g_idleAnimation = false; };
  document.getElementById('animationWalkOffButton').onclick = () => { g_walkAnimation = false; };
  document.getElementById('animationIdleOnButton').onclick = () => { g_idleAnimation = true;  g_walkAnimation = false; };
  document.getElementById('animationIdleOffButton').onclick = () => { g_idleAnimation = false; };
 
  // Slider events
  document.getElementById('legSlide').addEventListener('input', function() { g_legAngle = parseFloat(this.value); });
  document.getElementById('bottomNeck').addEventListener('input', function() { g_bottomNeck = parseFloat(this.value); });
  document.getElementById('topNeck').addEventListener('input', function() { g_topNeck = parseFloat(this.value); });
  document.getElementById('tailSlide').addEventListener('input', function() { g_tailAngle = parseFloat(this.value); });
  document.getElementById('angleSlide').addEventListener('input', function() { g_globalAngle = parseFloat(this.value); });
}

let g_animation = false;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onclick = () => canvas.requestPointerLock();

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = !g_pokeAnimation;
    }
    g_mouseDown = true;
    g_mouseX = ev.clientX;
    g_mouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  document.addEventListener('mousemove', function(ev) {
    if (document.pointerLockElement === canvas) {
      let dx = ev.movementX;
      let dy = ev.movementY;
      if (dx !== 0) {
        g_camera.panLeft(-dx * 0.15); 
      }
      renderAllShapes();
    }
  }, false);

  document.onkeydown = keydown;

  initTextures();

  // Initialize camera after shaders and textures are ready
  g_camera = new Camera(canvas.width, canvas.height, g_map);

  // shift+click
  // canvas.onmousemove = function(ev) {
  //   if (ev.buttons === 1 && !ev.shiftKey) {
  //     if (g_mouseLastX === -1) {
  //       g_mouseLastX = ev.clientX;
  //       g_mouseLastY = ev.clientY;
  //       return;
  //     }
  //     g_globalAngle  += (ev.clientX - g_mouseLastX) * 0.5;
  //     g_globalAngleX += (ev.clientY - g_mouseLastY) * 0.5;
  //     g_mouseLastX = ev.clientX;
  //     g_mouseLastY = ev.clientY;
  //   } else {
  //     g_mouseLastX = -1;
  //     g_mouseLastY = -1;
  //   }
  // };
   
  // Specify the color for clearing <canvas>
  gl.clearColor(0.02, 0.02, 0.05, 1.0);
  requestAnimationFrame(tick);
}

// Animation loop
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  // Update the animation angles according to which animations are active
  if (g_walkAnimation) {
    // Alternating legs
    g_legAngle   = 28 * Math.sin(g_seconds * 2.5);
    // Gentle neck bob
    g_bottomNeck = 5 * Math.sin(g_seconds * 2.5);
    // Tail sways side to side
    g_tailAngle  = 20 * Math.sin(g_seconds * 2.5 + 0.5);
  }
 
  if (g_idleAnimation) {
    // Very slow body sway / breathing — done via pokeBody offset in render
    // Neck shakes subtly
    g_bottomNeck = 3 * Math.sin(g_seconds * 1.2);
    g_topNeck    = 2 * Math.sin(g_seconds * 1.5 + 0.4);
    // Tail periodically flicks
    g_tailAngle  = 15 * Math.sin(g_seconds * 0.9);
    // Legs still
    g_legAngle   = 0;
  }
}

var g_camera;

// Keyboard
function keydown(ev) {
  let isSprinting = ev.shiftKey;
  if (ev.keyCode == 87) {  // W
    g_camera.moveForward(isSprinting);
  } 
  else if (ev.keyCode == 83) {  // S
    g_camera.moveBackwards(isSprinting);
  } 
  else if (ev.keyCode == 65) {  // A
    g_camera.moveLeft(isSprinting);
  } 
  else if (ev.keyCode == 68) {  // D
    g_camera.moveRight(isSprinting);
  } 
  else if (ev.keyCode == 81) {  // Q
    g_camera.panLeft();
  } 
  else if (ev.keyCode == 69) {  // E
    g_camera.panRight();
  }
  else if (ev.keyCode == 90) {  // Z
    modifyMap(true);
  } 
  else if (ev.keyCode == 88) { // X 
    modifyMap(false);
  }
  renderAllShapes();
  console.log("Key pressed: " + ev.keyCode);
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
];

function drawMap() {
  for (let x = 0; x < g_map.length; x++) {
    let row = g_map[x];
    for (let y = 0; y < row.length; y++) {
      let height = row[y];
      for (let h = 0; h < height; h++) {
        let wall = new Cube();
        if (y > 19) {
          wall.textureNum = 3;
        }
        else {
          wall.textureNum = 1;
        }
        wall.matrix.translate(x - 4, -0.93 + h, y - 4);
        wall.render();
      }
    }
  }
}

// Block editing
function modifyMap(isAddingBlock) {
  let forward = new Vector3();
  forward.set(g_camera.at);
  forward.sub(g_camera.eye);
  forward.normalize();

  let targetX = g_camera.eye.elements[0] + forward.elements[0]*2;
  let targetZ = g_camera.eye.elements[2] + forward.elements[2]*2;

  let mapX = Math.floor(targetX + 4);
  let mapZ = Math.floor(targetZ + 4);

  if (mapX >= 0 && mapX < g_map.length && mapZ >= 0 && mapZ < g_map[0].length) {
    if (isAddingBlock) {
      g_map[mapX][mapZ] += 1;
    } 
    // Removing a block
    else {
      if (g_map[mapX][mapZ] > 0) {
        g_map[mapX][mapZ] -= 1;
      }
    }
  }
}

function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Poke offsets
  var pokeNeck = 0;
  if (g_poke) {
    var pt = g_seconds - g_pokeStartTime;
    if (pt < 1.8) {
      pokeNeck = -50 * Math.sin(Math.PI * pt / 0.9);
    } else {
      g_poke = false;
    }
  }

  // Walk animation
  var bodySway  = g_walkAnimation ? 3  * Math.sin(g_seconds * 2.5) : 0;
  // Idle animation
  var idleBob   = g_idleAnimation ? 0.012 * Math.sin(g_seconds * 1.8) : 0;
 
  var baseY = -0.3 + idleBob;

  // Leg swing values
  // Walking
  var fL =  g_walkAnimation ? g_legAngle : g_legAngle;
  var fR = -fL;
  var bL = -fL;
  var bR =  fL;
  // Knee bend follows swing
  var kFL = g_walkAnimation ?  10 * Math.max(0,  Math.sin(g_seconds * 2.5)) : 0;
  var kFR = g_walkAnimation ?  10 * Math.max(0, -Math.sin(g_seconds * 2.5)) : 0;
  var kBL = kFR;
  var kBR = kFL;

  // Pass the projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMatrix.elements);

  // Pass the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // GlobalRotate is identity
  const identity = new Matrix4();
  identity.rotate(g_globalAngle,   0, 1, 0);
  identity.rotate(-g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identity.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawMap();

  // Draw the sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(100, 100, 100);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Draw the floor
  var body = new Cube();
  body.color = [0.2, 0.6, 0.1, 1.0];
  body.textureNum = -2;
  body.matrix.translate(0, -1, - 1, 0);
  body.matrix.scale(100,0,100);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // ================= BODY =================
  var bodyMain = new Cube();
  bodyMain.color = [0.9, 0.7, 0.2, 1];
  bodyMain.textureNum = -2;
  bodyMain.matrix.translate(-0.25, baseY, 0);
  bodyMain.matrix.rotate(bodySway, 0, 0, 1);
  bodyMain.matrix.scale(0.5, 0.25, 0.35);
  bodyMain.render();

  var bodyBack = new Cube();
  bodyBack.color = [0.85, 0.65, 0.2, 1];
  bodyBack.textureNum = -2;
  bodyBack.matrix.translate(-0.26, baseY, 0.35);
  bodyBack.matrix.rotate(bodySway, 0, 0, 1);
  bodyBack.matrix.scale(0.52, 0.23, 0.2);
  bodyBack.render();

  var bodyFront = new Cube();
  bodyFront.color = [0.95, 0.75, 0.25, 1];
  bodyFront.textureNum = -2;
  bodyFront.matrix.translate(-0.23, baseY, -0.2);
  bodyFront.matrix.rotate(bodySway, 0, 0, 1);
  bodyFront.matrix.scale(0.46, 0.23, 0.2);
  bodyFront.render();

  // ================= NECK =================
  var neckBase = new Matrix4();
  neckBase.translate(-0.06, -0.2 + idleBob, -0.1);
  neckBase.rotate(90, 0, 1, 0);

  var neck1 = new Cube();
  neck1.color = [0.95, 0.75, 0.25, 1];
  neck1.textureNum = -2;
  neck1.matrix = new Matrix4(neckBase);
  neck1.matrix.rotate(-20 + g_bottomNeck + pokeNeck, 0, 0, 1);
  var n1 = new Matrix4(neck1.matrix);
  neck1.matrix.scale(0.12, 0.25, 0.12);
  neck1.render();
 
  var neck2 = new Cube();
  neck2.color = [0.95, 0.75, 0.25, 1];
  neck2.textureNum = -2;
  neck2.matrix = new Matrix4(n1);
  neck2.matrix.translate(0, 0.25, 0.005);
  neck2.matrix.rotate(-10, 0, 0, 1);
  var n2 = new Matrix4(neck2.matrix);
  neck2.matrix.scale(0.11, 0.23, 0.11);
  neck2.render();
 
  var neck3 = new Cube();
  neck3.color = [0.95, 0.75, 0.25, 1];
  neck3.textureNum = -2;
  neck3.matrix = new Matrix4(n2);
  neck3.matrix.translate(0, 0.23, 0.007);
  neck3.matrix.rotate(-5 + g_topNeck, 0, 0, 1);
  var n3 = new Matrix4(neck3.matrix);
  neck3.matrix.scale(0.10, 0.20, 0.10);
  neck3.render();

  // ================= HEAD =================
  var head = new Cube();
  head.color = [0.95, 0.75, 0.25, 1];
  head.textureNum = -2;
  head.matrix = new Matrix4(n3);
  head.matrix.translate(-0.05, 0.20, -0.02);
  head.matrix.scale(0.2, 0.15, 0.15);
  head.render();

  // ================= HORNS =================
  var horn1 = new Cylinder();
  horn1.color = [0.4, 0.2, 0.1, 1];
  horn1.textureNum = -2;
  horn1.matrix = new Matrix4(n3);
  horn1.matrix.translate(-0.02, 0.35, 0.11);
  horn1.matrix.scale(0.03, 0.1, 0.03);
  horn1.render();

  var horn2 = new Cylinder();
  horn2.color = [0.4, 0.2, 0.1, 1];
  horn2.textureNum = -2;
  horn2.matrix = new Matrix4(n3);
  horn2.matrix.translate(-0.02, 0.35, 0.002);
  horn2.matrix.scale(0.03, 0.1, 0.03);
  horn2.render();

  // ================= EYES =================
  var eye1 = new Cylinder();
  eye1.color = [0, 0, 0, 1];
  eye1.textureNum = -2;
  eye1.matrix = new Matrix4(n3);
  eye1.matrix.translate(0.08, 0.25, 0.13);
  eye1.matrix.scale(0.02, 0.02, 0.02);
  eye1.render();

  var eye2 = new Cylinder();
  eye2.color = [0, 0, 0, 1];
  eye2.textureNum = -2;
  eye2.matrix = new Matrix4(n3);
  eye2.matrix.translate(0.08, 0.25, -0.03);
  eye2.matrix.scale(0.02, 0.02, 0.02);
  eye2.render();

  // ================= LEGS =================
  function makeLeg(x, z, upperSwing, kneeSwing) {
    var legBase = new Matrix4();
    legBase.translate(x, baseY, z);
 
    // Upper leg
    var upper = new Cube();
    upper.color = [0.9, 0.7, 0.2, 1];
    upper.textureNum = -2;
    upper.matrix = new Matrix4(legBase);
    upper.matrix.translate(0, -0.05, 0);
    upper.matrix.rotate(upperSwing, 1, 0, 0);
    var upperMat = new Matrix4(upper.matrix);
    upper.matrix.translate(0, -0.20, 0);
    upper.matrix.scale(0.08, 0.25, 0.08);
    upper.render();
 
    // Lower leg (knee)
    var lower = new Cube();
    lower.color = [0.85, 0.65, 0.18, 1];
    lower.textureNum = -2;
    lower.matrix = new Matrix4(upperMat);
    lower.matrix.translate(0, -0.25, 0);
    lower.matrix.rotate(kneeSwing, 1, 0, 0);
    var lowerMat = new Matrix4(lower.matrix);
    lower.matrix.translate(0, -0.12, 0);
    lower.matrix.scale(0.07, 0.18, 0.07);
    lower.render();
 
    // Hoof
    var foot = new Cube();
    foot.color = [0.4, 0.2, 0.1, 1];
    foot.textureNum = -2;
    foot.matrix = new Matrix4(lowerMat);
    foot.matrix.translate(0, -0.19, 0);
    foot.matrix.scale(0.09, 0.07, 0.09);
    foot.render();
  }

  makeLeg(-0.18,  0.2, fL, kFL); // front left
  makeLeg( 0.1,   0.2, fR, kFR); // front right
  makeLeg(-0.18, -0.2, bL, kBL); // back left
  makeLeg( 0.1,  -0.2, bR, kBR); // back right

  // ================= TAIL =================
  var tail = new Cylinder();
  tail.color = [0.6, 0.4, 0.2, 1];
  tail.matrix.translate(0.0, -0.1 + idleBob, 0.4);
  tail.matrix.rotate(g_tailAngle, 0, 1, 0);
  tail.matrix.rotate(90, 1, 0, 0);
  tail.matrix.scale(0.04, 0.5, 0.04);
  tail.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + "  fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
