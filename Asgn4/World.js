var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;
  uniform vec3 u_lightColor;
  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightColor;
  uniform vec3 u_spotlightDir;
  uniform float u_spotlightCutoff;
  uniform float u_spotlightExponent;

  void main() {
    vec4 baseColor;
    if      (u_whichTexture == -3) { baseColor = vec4((v_Normal+1.0)/2.0, 1.0); }
    else if (u_whichTexture == -2) { baseColor = u_FragColor; }
    else if (u_whichTexture == -1) { baseColor = vec4(v_UV, 1.0, 1.0); }
    else if (u_whichTexture ==  0) { baseColor = texture2D(u_Sampler0, v_UV); }
    else if (u_whichTexture ==  1) { baseColor = texture2D(u_Sampler1, v_UV); }
    else if (u_whichTexture ==  2) { baseColor = texture2D(u_Sampler2, v_UV); }
    else if (u_whichTexture ==  3) { baseColor = texture2D(u_Sampler3, v_UV); }
    else                           { baseColor = vec4(1.0, 0.2, 0.2, 1.0); }

    vec3 N = normalize(v_Normal);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    vec3 totalDiffuse  = vec3(0.0);
    vec3 totalSpecular = vec3(0.0);

    if (u_lightOn) {
      vec3 L      = normalize(u_lightPos - vec3(v_VertPos));
      float nDotL = max(dot(N, L), 0.0);
      vec3 R      = reflect(-L, N);
      float spec  = pow(max(dot(E, R), 0.0), 10.0);
      totalDiffuse  += vec3(baseColor) * nDotL * u_lightColor;
      totalSpecular += spec * u_lightColor;
    }

    if (u_spotlightOn) {
      vec3 L_spot     = normalize(u_spotlightPos - vec3(v_VertPos));
      vec3 D          = -normalize(u_spotlightDir);
      float spotCos   = dot(D, L_spot);
      if (spotCos >= u_spotlightCutoff) {
        float factor  = pow(spotCos, u_spotlightExponent);
        float nDotL   = max(dot(N, L_spot), 0.0);
        vec3 R        = reflect(-L_spot, N);
        float spec    = pow(max(dot(E, R), 0.0), 10.0);
        totalDiffuse  += vec3(baseColor) * nDotL * u_spotlightColor * factor;
        totalSpecular += spec * u_spotlightColor * factor;
      }
    }

    vec3 ambient = vec3(baseColor) * 0.3;
    gl_FragColor = vec4(totalDiffuse + totalSpecular + ambient, 1.0);
  }`;


let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_NormalMatrix;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_lightColor;
let u_spotlightOn;
let u_spotlightPos;
let u_spotlightDir;
let u_spotlightCutoff;
let u_spotlightExponent;
let u_spotlightColor;


function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) { console.log('Failed to get WebGL context'); return; }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.'); return;
  }
  a_Position = gl.getAttribLocation (gl.program, 'a_Position');
  a_UV = gl.getAttribLocation (gl.program, 'a_UV');
  a_Normal = gl.getAttribLocation (gl.program, 'a_Normal');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  u_spotlightDir = gl.getUniformLocation(gl.program, 'u_spotlightDir');
  u_spotlightCutoff = gl.getUniformLocation(gl.program, 'u_spotlightCutoff');
  u_spotlightExponent = gl.getUniformLocation(gl.program, 'u_spotlightExponent');
  u_spotlightColor = gl.getUniformLocation(gl.program, 'u_spotlightColor');
}

let g_globalAngle = 0;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_mouseDown = false;

// Lighting
let g_normalOn = false;
let g_lightPos = [0, 0.5, 2];
let g_lightColor = [1.0, 1.0, 1.0, 1.0];
let g_lightOn = true;
let g_spotlightOn = false;
let g_spotlightPos = [0, 2, 0];
let g_spotlightDir = [0, -1, 0];
let g_spotlightCutoff = Math.cos(30 * Math.PI / 180);
let g_spotlightExponent = 10.0;

// Animation State
let g_legAngle = 0;
let g_bottomNeck = 0;
let g_topNeck = 0;
let g_tailAngle = 0;
let g_walkAnimation = false;
let g_idleAnimation = false;
let g_pokeAnimation = false;

var g_camera;


function addActionsForHtmlUI() {
  // Lighting
  const safeById = id => document.getElementById(id);

  const bind = (id, fn) => { const el = safeById(id); if (el) el.onclick = fn; };
  const bindSlide = (id, fn) => {
    const el = safeById(id);
    if (el) el.addEventListener('mousemove', function(ev) { if (ev.buttons == 1) { fn(this.value); renderAllShapes(); } });
  };
  const bindSlideLive = (id, fn) => {
    const el = safeById(id);
    if (el) el.addEventListener('mousemove', function() { fn(this.value); renderAllShapes(); });
  };

  bind('normalOnButton', () => { g_normalOn = true;  });
  bind('normalOffButton', () => { g_normalOn = false; });
  bind('lightOnButton', () => { g_lightOn = true;  });
  bind('lightOffButton', () => { g_lightOn  = false; });
  bind('spotlightOnButton', () => { g_spotlightOn = true;  });
  bind('spotlightOffButton',() => { g_spotlightOn = false; });

  // Point-light positions
  bindSlide('lightSliderX', v => { g_lightPos[0] = v / 100; });
  bindSlide('lightSliderY', v => { g_lightPos[1] = v / 100; });
  bindSlide('lightSliderZ', v => { g_lightPos[2] = v / 100; });
  bindSlide('lightSliderR', v => { g_lightColor[0] = v / 100; });
  bindSlide('lightSliderG', v => { g_lightColor[1] = v / 100; });
  bindSlide('lightSliderB', v => { g_lightColor[2] = v / 100; });

  // Spotlight position
  bindSlide('spotX', v => { g_spotlightPos[0] = v / 100; });
  bindSlide('spotY', v => { g_spotlightPos[1] = v / 100; });
  bindSlide('spotZ', v => { g_spotlightPos[2] = v / 100; });

  // Global angle slider (both projects used a slider for this)
  const angleSlider = safeById('angleSlider') || safeById('angleSlide');
  if (angleSlider) {
    angleSlider.addEventListener('mousemove', function() {
      g_globalAngle = this.value; renderAllShapes();
    });
  }

  // Animation
  bind('animationWalkOnButton', () => { g_walkAnimation = true;  g_idleAnimation = false; });
  bind('animationWalkOffButton', () => { g_walkAnimation = false; });
  bind('animationIdleOnButton', () => { g_idleAnimation = true;  g_walkAnimation = false; });
  bind('animationIdleOffButton', () => { g_idleAnimation = false; });

  // Manual sliders
  bindSlideLive('legSlide', v => { g_legAngle   = parseFloat(v); });
  bindSlideLive('bottomNeck', v => { g_bottomNeck = parseFloat(v); });
  bindSlideLive('topNeck', v => { g_topNeck    = parseFloat(v); });
  bindSlideLive('tailSlide', v => { g_tailAngle  = parseFloat(v); });
}

// Textures
function initTextures() {
  const load = (src, unit, sampler, flipY = 1) => {
    const img = new Image();
    img.onload = () => sendImageToTexture(img, unit, sampler, flipY);
    img.src = src;
  };
  load('sky.jpg',      0, u_Sampler0, 0);
  load('leaves.png',   1, u_Sampler2, 1);
  load('dirt.jpg',     2, u_Sampler3, 1);
  return true;
}

function sendImageToTexture(image, unit, sampler, flipY) {
  const tex = gl.createTexture();
  if (!tex) { console.log('Failed to create texture'); return; }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(sampler, unit);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onclick = () => canvas.requestPointerLock();

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) { g_pokeAnimation = !g_pokeAnimation; }
    g_mouseDown = true;
    g_mouseX = ev.clientX;
    g_mouseY = ev.clientY;
  };

  canvas.onmouseup = () => { g_mouseDown = false; };

  document.addEventListener('mousemove', function(ev) {
    if (document.pointerLockElement === canvas) {
      const dx = ev.movementX;
      if (dx !== 0) { g_camera.panLeft(-dx * 0.15); }
      renderAllShapes();
    }
  }, false);

  document.onkeydown = keydown;

  g_camera = new Camera(canvas.width, canvas.height, g_map);

  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

// Animation Loop
var g_startTime = performance.now() / 1000.0;
var g_seconds   = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  // Giraffe walk animation
  if (g_walkAnimation) {
    g_legAngle   = 28 * Math.sin(g_seconds * 2.5);
    g_bottomNeck =  5 * Math.sin(g_seconds * 2.5);
    g_tailAngle  = 20 * Math.sin(g_seconds * 2.5 + 0.5);
  }

  // Giraffe idle animation
  if (g_idleAnimation) {
    g_bottomNeck = 3 * Math.sin(g_seconds * 1.2);
    g_topNeck    = 2 * Math.sin(g_seconds * 1.5 + 0.4);
    g_tailAngle  = 15 * Math.sin(g_seconds * 0.9);
    g_legAngle   = 0;
  }

  // Animate the point-light orbit
  g_lightPos[0] = Math.cos(g_seconds);
}

// Keyboard
function keydown(ev) {
  const sprint = ev.shiftKey;
  switch (ev.keyCode) {
    case 87: g_camera.moveForward(sprint); break; // W
    case 83: g_camera.moveBackwards(sprint); break; // S
    case 65: g_camera.moveLeft(sprint); break; // A
    case 68: g_camera.moveRight(sprint); break; // D
    case 81: g_camera.panLeft(); break; // Q
    case 69: g_camera.panRight(); break; // E
  }
  renderAllShapes();
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

// Render
function renderAllShapes() {
  const startTime = performance.now();

  // Matrices
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix,       false, g_camera.viewMatrix.elements);

  const rotateMatrix = new Matrix4();
  rotateMatrix.rotate( g_globalAngle,  0, 1, 0);
  rotateMatrix.rotate(-g_globalAngleX, 1, 0, 0);
  rotateMatrix.rotate(-g_globalAngleY, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, rotateMatrix.elements);

  // Default normal matrix (used for giraffe parts and anything not overriding it)
  const normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(rotateMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Lighting uniforms
  gl.uniform3f(u_lightPos, g_lightPos[0],    g_lightPos[1],    g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform3f(u_lightColor, g_lightColor[0],  g_lightColor[1],  g_lightColor[2]);
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3f(u_spotlightDir, g_spotlightDir[0], g_spotlightDir[1], g_spotlightDir[2]);
  gl.uniform1f(u_spotlightCutoff, g_spotlightCutoff);
  gl.uniform1f(u_spotlightExponent,g_spotlightExponent);
  gl.uniform3f(u_spotlightColor, 1.0, 1.0, 1.0);

  // Light obj
  var light = new Sphere(g_lightColor);
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.25, -0.25, -0.25);
  light.matrix.translate(-0.8, -0.8, -0.8);
  light.render();

  // Red sphere
  var sphere = new Sphere([1.0, 0.0, 0.0, 1.0]);
  if (g_normalOn) sphere.textureNum = -3;
  sphere.matrix.translate(5.0, 0.0, 0.0);
  sphere.render();

  // Sky box
  var sky = new Cube([0.1, 0.4, 1.0, 1.0]);
  sky.textureNum = g_normalOn ? -3 : 0;
  sky.matrix.scale(-15, -15, -15);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Ground
  var ground = new Cube([0.0, 0.7, 0.0, 1.0]);
  ground.textureNum = -2;
  ground.matrix.translate(0.0, -0.93, 0.0);
  ground.matrix.scale(100, 0, 100);
  ground.matrix.translate(-0.5, 0.0, -0.5);
  ground.render();


  // Giraffe Model

  // Reset normal matrix to the global rotate for giraffe flat-colour parts
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  const GX = 3.0;  // world-X offset
  const GZ = 0.0;  // world-Z offset

  // Derived animation values
  var idleBob  = g_idleAnimation ? 0.012 * Math.sin(g_seconds * 1.8) : 0;
  var bodySway = g_walkAnimation ? 3 * Math.sin(g_seconds * 2.5)     : 0;
  var baseY    = -0.3 + idleBob;

  var fL = g_legAngle,  fR = -fL, bL = -fL, bR = fL;
  var kFL = g_walkAnimation ?  10 * Math.max(0,  Math.sin(g_seconds * 2.5)) : 0;
  var kFR = g_walkAnimation ?  10 * Math.max(0, -Math.sin(g_seconds * 2.5)) : 0;
  var kBL = kFR, kBR = kFL;

  // Poke neck
  var pokeNeck = 0;
  if (g_pokeAnimation) {
    pokeNeck = -40 * Math.sin(g_seconds * 5);
  }

  function gPos(mat) {
    mat.translate(GX, 0, GZ);
    return mat;
  }

  // Body
  var gBody = new Cube();
  gBody.color = [0.9, 0.7, 0.2, 1];
  gBody.textureNum = g_normalOn ? -3 : -2;
  gBody.matrix.translate(GX - 0.25, baseY, GZ);
  gBody.matrix.rotate(bodySway, 0, 0, 1);
  gBody.matrix.scale(0.5, 0.25, 0.35);
  gBody.render();

  var gBodyBack = new Cube();
  gBodyBack.color = [0.85, 0.65, 0.2, 1];
  gBodyBack.textureNum = g_normalOn ? -3 : -2;
  gBodyBack.matrix.translate(GX - 0.26, baseY, GZ + 0.35);
  gBodyBack.matrix.rotate(bodySway, 0, 0, 1);
  gBodyBack.matrix.scale(0.52, 0.23, 0.2);
  gBodyBack.render();

  var gBodyFront = new Cube();
  gBodyFront.color = [0.95, 0.75, 0.25, 1];
  gBodyFront.textureNum = g_normalOn ? -3 : -2;
  gBodyFront.matrix.translate(GX - 0.23, baseY, GZ - 0.2);
  gBodyFront.matrix.rotate(bodySway, 0, 0, 1);
  gBodyFront.matrix.scale(0.46, 0.23, 0.2);
  gBodyFront.render();

  // Neck
  var neckBase = new Matrix4();
  neckBase.translate(GX - 0.06, -0.2 + idleBob, GZ - 0.1);
  neckBase.rotate(90, 0, 1, 0);

  var gNeck1 = new Cube();
  gNeck1.color = [0.95, 0.75, 0.25, 1];
  gNeck1.textureNum = g_normalOn ? -3 : -2;
  gNeck1.matrix = new Matrix4(neckBase);
  gNeck1.matrix.rotate(-20 + g_bottomNeck + pokeNeck, 0, 0, 1);
  var gN1 = new Matrix4(gNeck1.matrix);
  gNeck1.matrix.scale(0.12, 0.25, 0.12);
  gNeck1.render();

  var gNeck2 = new Cube();
  gNeck2.color = [0.95, 0.75, 0.25, 1];
  gNeck2.textureNum = g_normalOn ? -3 : -2;
  gNeck2.matrix = new Matrix4(gN1);
  gNeck2.matrix.translate(0, 0.25, 0.005);
  gNeck2.matrix.rotate(-10, 0, 0, 1);
  var gN2 = new Matrix4(gNeck2.matrix);
  gNeck2.matrix.scale(0.11, 0.23, 0.11);
  gNeck2.render();

  var gNeck3 = new Cube();
  gNeck3.color = [0.95, 0.75, 0.25, 1];
  gNeck3.textureNum = g_normalOn ? -3 : -2;
  gNeck3.matrix = new Matrix4(gN2);
  gNeck3.matrix.translate(0, 0.23, 0.007);
  gNeck3.matrix.rotate(-5 + g_topNeck, 0, 0, 1);
  var gN3 = new Matrix4(gNeck3.matrix);
  gNeck3.matrix.scale(0.10, 0.20, 0.10);
  gNeck3.render();

  // Head
  var gHead = new Cube();
  gHead.color = [0.95, 0.75, 0.25, 1];
  gHead.textureNum = g_normalOn ? -3 : -2;
  gHead.matrix = new Matrix4(gN3);
  gHead.matrix.translate(-0.05, 0.20, -0.02);
  gHead.matrix.scale(0.2, 0.15, 0.15);
  gHead.render();

  // Horns
  var gHorn1 = new Cylinder();
  gHorn1.color = [0.4, 0.2, 0.1, 1];
  gHorn1.textureNum = g_normalOn ? -3 : -2;
  gHorn1.matrix = new Matrix4(gN3);
  gHorn1.matrix.translate(-0.02, 0.35, 0.11);
  gHorn1.matrix.scale(0.03, 0.1, 0.03);
  gHorn1.render();

  var gHorn2 = new Cylinder();
  gHorn2.color = [0.4, 0.2, 0.1, 1];
  gHorn2.textureNum = g_normalOn ? -3 : -2;
  gHorn2.matrix = new Matrix4(gN3);
  gHorn2.matrix.translate(-0.02, 0.35, 0.002);
  gHorn2.matrix.scale(0.03, 0.1, 0.03);
  gHorn2.render();

  // Eyes
  var gEye1 = new Cylinder();
  gEye1.color = [0, 0, 0, 1];
  gEye1.textureNum = g_normalOn ? -3 : -2;
  gEye1.matrix = new Matrix4(gN3);
  gEye1.matrix.translate(0.08, 0.25, 0.13);
  gEye1.matrix.scale(0.02, 0.02, 0.02);
  gEye1.render();

  var gEye2 = new Cylinder();
  gEye2.color = [0, 0, 0, 1];
  gEye2.textureNum = g_normalOn ? -3 : -2;
  gEye2.matrix = new Matrix4(gN3);
  gEye2.matrix.translate(0.08, 0.25, -0.03);
  gEye2.matrix.scale(0.02, 0.02, 0.02);
  gEye2.render();

  // Legs
  function makeGiraffeLeg(lx, lz, upperSwing, kneeSwing) {
    var legBase = new Matrix4();
    legBase.translate(GX + lx, baseY, GZ + lz);

    var upper = new Cube();
    upper.color = [0.9, 0.7, 0.2, 1];
    upper.textureNum = g_normalOn ? -3 : -2;
    upper.matrix = new Matrix4(legBase);
    upper.matrix.translate(0, -0.05, 0);
    upper.matrix.rotate(upperSwing, 1, 0, 0);
    var upperMat = new Matrix4(upper.matrix);
    upper.matrix.translate(0, -0.20, 0);
    upper.matrix.scale(0.08, 0.25, 0.08);
    upper.render();

    var lower = new Cube();
    lower.color = [0.85, 0.65, 0.18, 1];
    lower.textureNum = g_normalOn ? -3 : -2;
    lower.matrix = new Matrix4(upperMat);
    lower.matrix.translate(0, -0.25, 0);
    lower.matrix.rotate(kneeSwing, 1, 0, 0);
    var lowerMat = new Matrix4(lower.matrix);
    lower.matrix.translate(0, -0.12, 0);
    lower.matrix.scale(0.07, 0.18, 0.07);
    lower.render();

    var foot = new Cube();
    foot.color = [0.4, 0.2, 0.1, 1];
    foot.textureNum = g_normalOn ? -3 : -2;
    foot.matrix = new Matrix4(lowerMat);
    foot.matrix.translate(0, -0.19, 0);
    foot.matrix.scale(0.09, 0.07, 0.09);
    foot.render();
  }

  makeGiraffeLeg(-0.18,  0.2, fL, kFL); // front-left
  makeGiraffeLeg( 0.1,   0.2, fR, kFR); // front-right
  makeGiraffeLeg(-0.18, -0.2, bL, kBL); // back-left
  makeGiraffeLeg( 0.1,  -0.2, bR, kBR); // back-right

  // Tail
  var gTail = new Cylinder();
  gTail.color = [0.6, 0.4, 0.2, 1];
  gTail.textureNum = g_normalOn ? -3 : -2;
  gTail.matrix.translate(GX + 0.0, -0.1 + idleBob, GZ + 0.4);
  gTail.matrix.rotate(g_tailAngle, 0, 1, 0);
  gTail.matrix.rotate(90, 1, 0, 0);
  gTail.matrix.scale(0.04, 0.5, 0.04);
  gTail.render();

  // FPS counter
  var duration = performance.now() - startTime;
  sendTextToHTML('ms: ' + Math.floor(duration) + '  fps: ' + Math.floor(10000 / duration) / 10, 'numdot');
}

function sendTextToHTML(text, htmlID) {
  var el = document.getElementById(htmlID);
  if (!el) { console.log('Failed to get ' + htmlID); return; }
  el.innerHTML = text;
}