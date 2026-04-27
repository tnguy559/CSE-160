class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Create the shared buffer once, reuse every frame
    if (!Cube._buf) {
      Cube._buf = gl.createBuffer();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube._buf);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
 
    // Each face: [shade, Float32Array of 6 vertices (2 triangles)]
    var r = rgba[0], g = rgba[1], b = rgba[2], a = rgba[3];
 
    Cube._drawFace(1.0,  r,g,b,a, new Float32Array([
      0,0,0, 1,1,0, 1,0,0,   0,0,0, 0,1,0, 1,1,0]));  // front
    Cube._drawFace(0.9,  r,g,b,a, new Float32Array([
      0,1,0, 0,1,1, 1,1,1,   0,1,0, 1,1,1, 1,1,0]));  // top
    Cube._drawFace(0.7,  r,g,b,a, new Float32Array([
      0,0,0, 1,0,1, 0,0,1,   0,0,0, 1,0,0, 1,0,1]));  // bottom
    Cube._drawFace(0.8,  r,g,b,a, new Float32Array([
      0,0,0, 0,0,1, 0,1,1,   0,0,0, 0,1,1, 0,1,0]));  // left
    Cube._drawFace(0.8,  r,g,b,a, new Float32Array([
      1,0,0, 1,1,1, 1,0,1,   1,0,0, 1,1,0, 1,1,1]));  // right
    Cube._drawFace(0.6,  r,g,b,a, new Float32Array([
      0,0,1, 1,0,1, 1,1,1,   0,0,1, 1,1,1, 0,1,1]));  // back
  }
 
  static _drawFace(shade, r, g, b, a, verts) {
    gl.uniform4f(u_FragColor, r*shade, g*shade, b*shade, a);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}