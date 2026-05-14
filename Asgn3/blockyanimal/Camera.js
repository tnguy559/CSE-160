// Patch missing Vector3 methods if the library doesn't provide them
if (typeof Vector3 !== 'undefined') {
  if (!Vector3.prototype.set) {
    Vector3.prototype.set = function(src) {
      const s = src.elements ? src.elements : src;
      this.elements[0] = s[0];
      this.elements[1] = s[1];
      this.elements[2] = s[2];
      return this;
    };
  }
  if (!Vector3.prototype.add) {
    Vector3.prototype.add = function(v) {
      const s = v.elements ? v.elements : v;
      this.elements[0] += s[0];
      this.elements[1] += s[1];
      this.elements[2] += s[2];
      return this;
    };
  }
  if (!Vector3.prototype.sub) {
    Vector3.prototype.sub = function(v) {
      const s = v.elements ? v.elements : v;
      this.elements[0] -= s[0];
      this.elements[1] -= s[1];
      this.elements[2] -= s[2];
      return this;
    };
  }
  if (!Vector3.prototype.mul) {
    Vector3.prototype.mul = function(scalar) {
      this.elements[0] *= scalar;
      this.elements[1] *= scalar;
      this.elements[2] *= scalar;
      return this;
    };
  }
  // Static cross product: returns a new Vector3
  if (!Vector3.cross) {
    Vector3.cross = function(a, b) {
      const u = a.elements ? a.elements : a;
      const v = b.elements ? b.elements : b;
      return new Vector3([
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0]
      ]);
    };
  }
}

class Camera {
  constructor(width, height, g_map) {
    this.type   = 'camera';
    this.width  = width;
    this.height = height;
    this.g_map  = g_map;
    this.fov    = 60;

    // Start position: slightly in front of and facing the giraffe at the origin
    this.eye = new Vector3([ 0.0, 0.3, -1.5]);
    this.at  = new Vector3([ 0.0, 0.3,  0.0]);
    this.up  = new Vector3([ 0.0, 1.0,  0.0]);

    this.viewMatrix = new Matrix4();
    this.projMatrix = new Matrix4();
    this.updateMatrices();
  }

  // Recalculate view and projection matrices from current eye/at/up
  updateMatrices() {
    this.projMatrix.setPerspective(this.fov, this.width / this.height, 0.1, 100);
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
  }

  // Returns true if (x, z) is not inside a map wall.
  // Out-of-bounds positions are treated as open space so the player
  // can freely walk around outside the walled area.
  canWalkTo(x, z) {
    const radius = 0.3;
    const probePoints = [
      { x: x,          z: z          },
      { x: x + radius, z: z          },
      { x: x - radius, z: z          },
      { x: x,          z: z + radius },
      { x: x,          z: z - radius },
      { x: x + radius, z: z + radius },
      { x: x - radius, z: z + radius },
      { x: x + radius, z: z - radius },
      { x: x - radius, z: z - radius },
    ];

    const mapRows = this.g_map.length;
    const mapCols = this.g_map[0].length;

    for (let p of probePoints) {
      const col = Math.floor(p.x + 16);
      const row = Math.floor(p.z + 16);
      // Skip points outside the map — open world beyond the walls
      if (col < 0 || col >= mapRows || row < 0 || row >= mapCols) continue;
      // Block movement into any cell with a wall (height > 0)
      if (this.g_map[col][row] > 0) return false;
    }
    return true;
  }

  // Move in the direction the camera is facing
  moveForward(isSprinting = false) {
    const speed = isSprinting ? 1.0 : 0.3;
    var forward = new Vector3();
    forward.set(this.at);
    forward.sub(this.eye);
    forward.normalize();
    forward.mul(speed);

    const nx = this.eye.elements[0] + forward.elements[0];
    const nz = this.eye.elements[2] + forward.elements[2];
    if (this.canWalkTo(nx, nz)) {
      this.eye.add(forward);
      this.at.add(forward);
      this.updateMatrices();
    }
  }

  // Move opposite to the direction the camera is facing
  moveBackwards(isSprinting = false) {
    const speed = isSprinting ? 1.0 : 0.3;
    var back = new Vector3();
    back.set(this.eye);
    back.sub(this.at);
    back.normalize();
    back.mul(speed);

    const nx = this.eye.elements[0] + back.elements[0];
    const nz = this.eye.elements[2] + back.elements[2];
    if (this.canWalkTo(nx, nz)) {
      this.eye.add(back);
      this.at.add(back);
      this.updateMatrices();
    }
  }

  // Strafe left (perpendicular to forward, using cross product)
  moveLeft(isSprinting = false) {
    const speed = isSprinting ? 1.0 : 0.3;
    var forward = new Vector3();
    forward.set(this.at);
    forward.sub(this.eye);

    var left = Vector3.cross(this.up, forward);
    left.normalize();
    left.mul(speed);

    const nx = this.eye.elements[0] + left.elements[0];
    const nz = this.eye.elements[2] + left.elements[2];
    if (this.canWalkTo(nx, nz)) {
      this.eye.add(left);
      this.at.add(left);
      this.updateMatrices();
    }
  }

  // Strafe right (perpendicular to forward, opposite of left)
  moveRight(isSprinting = false) {
    const speed = isSprinting ? 1.0 : 0.3;
    var forward = new Vector3();
    forward.set(this.at);
    forward.sub(this.eye);

    var right = Vector3.cross(forward, this.up);
    right.normalize();
    right.mul(speed);

    const nx = this.eye.elements[0] + right.elements[0];
    const nz = this.eye.elements[2] + right.elements[2];
    if (this.canWalkTo(nx, nz)) {
      this.eye.add(right);
      this.at.add(right);
      this.updateMatrices();
    }
  }

  // Rotate the look direction left by alpha degrees
  panLeft(alpha = 7) {
    var forward = new Vector3();
    forward.set(this.at);
    forward.sub(this.eye);

    var rot = new Matrix4();
    rot.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var rotated = rot.multiplyVector3(forward);

    this.at.set(this.eye);
    this.at.add(rotated);
    this.updateMatrices();
  }

  // Rotate the look direction right by alpha degrees
  panRight(alpha = 7) {
    var forward = new Vector3();
    forward.set(this.at);
    forward.sub(this.eye);

    var rot = new Matrix4();
    rot.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    var rotated = rot.multiplyVector3(forward);

    this.at.set(this.eye);
    this.at.add(rotated);
    this.updateMatrices();
  }
}