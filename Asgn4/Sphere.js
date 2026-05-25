// Shortcut function for sine calculations
function sin(x) {
  return Math.sin(x);
}

// Shortcut function for cosine calculations
function cos(x) {
  return Math.cos(x);
}

class Sphere {
  constructor(color=[1.0, 1.0, 1.0, 1.0]) {
    // Shape type identifier
    this.type='sphere';

    // Position was previously used but is commented out
    // this.position = [0.0, 0.0, 0.0];

    // Sphere color in RGBA format
    this.color = color;

    // Transformation matrix for movement, scaling, and rotation
    this.matrix = new Matrix4();

    // Texture number (-2 usually means no texture)
    this.textureNum = -2;

    // Stores sphere vertices as a Float32Array
    this.verts32 = new Float32Array([]);
  }

  // Render this shape
  render() {
    // Position and size variables were previously used
    // var xy = this.position;
    var rgba = this.color;
    // var size = this.size;

    // Pass the sphere color to the fragment shader
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass transformation matrix to shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass texture selection number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Controls sphere detail level (smaller value = smoother sphere)
    var d = Math.PI / 10;
    var dd = Math.PI / 10;
    
    // Loop through vertical slices of the sphere
    for (var t = 0; t < Math.PI; t += d) {

      // Loop through horizontal slices of the sphere
      for (var r = 0; r < 2 * Math.PI; r += d) {

        // Calculate four corner points of the current sphere patch
        var p1 = [sin(t)*cos(r), sin(t)*sin(r), cos(t)];
        var p2 = [sin(t+dd)*cos(r), sin(t+dd)*sin(r), cos(t+dd)];
        var p3 = [sin(t)*cos(r+dd), sin(t)*sin(r+dd), cos(t)];
        var p4 = [sin(t+dd)*cos(r+dd), sin(t+dd)*sin(r+dd), cos(t+dd)];

        // Generate UV texture coordinates for mapping textures
        var uv1 = [t/Math.PI, r/(2*Math.PI)];
        var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
        var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
        var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

        // First triangle of the sphere patch
        var v = [];
        var uv = [];

        // Add vertices
        v = v.concat(p1);
        v = v.concat(p2);
        v = v.concat(p4);

        // Add UV coordinates
        uv = uv.concat(uv1);
        uv = uv.concat(uv2);
        uv = uv.concat(uv4);

        // Draw first triangle
        // Vertex positions are reused as normals
        // because a sphere's normals point outward from the center
        drawTriangle3DUVNormal(v, uv, v);

        // Second triangle of the sphere patch
        v = [];
        uv = [];

        // Add vertices
        v = v.concat(p1);
        v = v.concat(p4);
        v = v.concat(p3);

        // Add UV coordinates
        uv = uv.concat(uv1);
        uv = uv.concat(uv4);
        uv = uv.concat(uv3);

        // Draw second triangle
        drawTriangle3DUVNormal(v, uv, v);
      }
    }
  }
}