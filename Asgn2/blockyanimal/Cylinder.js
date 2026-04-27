class Cylinder {
  constructor() {
    this.type = 'cylinder';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 10; // low poly is fine and fast
  }
 
  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
    var n = this.segments;
    var TWO_PI = Math.PI * 2;
 
    for (var i = 0; i < n; i++) {
      var a1 = (i / n) * TWO_PI;
      var a2 = ((i + 1) / n) * TWO_PI;
      var x1 = 0.5 * Math.cos(a1), z1 = 0.5 * Math.sin(a1);
      var x2 = 0.5 * Math.cos(a2), z2 = 0.5 * Math.sin(a2);
 
      // Side face — shade by angle for cheap lighting effect
      var shade = 0.72 + 0.28 * Math.cos(a1);
      gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
      drawTriangle3D([x1,0,z1,  x2,0,z2,  x2,1,z2]);
      drawTriangle3D([x1,0,z1,  x2,1,z2,  x1,1,z1]);
 
      // Bottom cap
      gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
      drawTriangle3D([0,0,0,  x1,0,z1,  x2,0,z2]);
 
      // Top cap
      gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
      drawTriangle3D([0,1,0,  x2,1,z2,  x1,1,z1]);
    }
  }
}