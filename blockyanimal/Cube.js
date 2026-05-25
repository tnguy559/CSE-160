class Cube {
  constructor(color=[1.0, 1.0, 1.0, 1.0]) {
    this.type='cube';
    // this.position = [0.0, 0.0, 0.0];
    this.color = color;
    // this.size = 5.0;
    // this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -1;
    this.vertices = new Float32Array([
      // Front
      0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0,
      // Top
      0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0,
      // Left
      0,0,0, 0,0,1, 0,1,1,  0,0,0, 0,1,1, 0,1,0,
      // Right
      1,0,0, 1,0,1, 1,1,1,  1,0,0, 1,1,1, 1,1,0,
      // Back
      0,0,1, 1,0,1, 1,1,1,  0,0,1, 1,1,1, 0,1,1,
      // Bottom
      0,0,0, 0,0,1, 1,0,1,  0,0,0, 1,0,1, 1,0,0
    ]);
    this.uvs = new Float32Array([
      // Front
      0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
      // Top
      0,0, 0,1, 1,1,  0,0, 1,1, 1,0,
      // Left
      1,0, 0,0, 0,1,  1,0, 0,1, 1,1,
      // Right
      0,0, 1,0, 1,1,  0,0, 1,1, 0,1,
      // Back
      1,0, 0,0, 0,1,  1,0, 0,1, 1,1,
      // Bottom
      0,1, 0,0, 1,0,  0,1, 1,0, 1,1
    ]);
  }

  // Render this shape
  render() {
    // var xy = this.position;
    var rgba = this.color;
    // var size = this.size;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Draw all 36 vertices in ONE call
    drawTriangle3DUV_All(this.vertices, this.uvs);

    // // Front of cube
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0], [0.0, 0.0,   1.0, 1.0,   1.0, 0.0] );
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0], [0.0, 0.0,   0.0, 1.0,   1.0, 1.0] );
    // // Pass color of point to u_FragColor
    // gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

    // // Top of cube
    // drawTriangle3DUV( [0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0.0, 0.0,   0.0, 1.0,   1.0, 1.0] );
    // drawTriangle3DUV( [0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0.0, 0.0,   1.0, 1.0,   1.0, 0.0] );
    // gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    
    // // Left of cube
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0], [1.0, 0.0,   0.0, 0.0,   0.0, 1.0] );
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0], [1.0, 0.0,   0.0, 1.0,   1.0, 1.0] );
    
    // // Right of cube
    // drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], [0.0, 0.0,   1.0, 0.0,   1.0, 1.0] );
    // drawTriangle3DUV( [1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0.0, 0.0,   1.0, 1.0,   0.0, 1.0] );
    // gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    
    // // Back of cube
    // drawTriangle3DUV( [0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], [1.0, 0.0,   0.0, 0.0,   0.0, 1.0] );
    // drawTriangle3DUV( [0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0], [1.0, 0.0,   0.0, 1.0,   1.0, 1.0] );
    // gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);

    // // Bottom of cube
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0], [0.0, 1.0,   0.0, 0.0,   1.0, 0.0] );
    // drawTriangle3DUV( [0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 0.0, 0.0], [0.0, 1.0,   1.0, 0.0,   1.0, 1.0] );
  }
}