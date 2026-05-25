class Cube {
  constructor(color = [1.0, 1.0, 1.0, 1.0]) {
    // Basic cube properties
    this.type = 'cube';
    this.color = color;

    // Transformation matrix for position, rotation, and scale
    this.matrix = new Matrix4();

    // Matrix used for lighting calculations (surface normals)
    this.normalMatrix = new Matrix4();

    // Default texture number (-2 usually means no texture)
    this.textureNum = -2;
  }

  // Render the cube to the WebGL canvas
  render() {
    // Destructure RGBA values for readability
    const [r, g, b, a] = this.color;

    // Send cube color to fragment shader
    gl.uniform4f(u_FragColor, r, g, b, a);

    // Send transformation matrix to vertex shader
    gl.uniformMatrix4fv(
      u_ModelMatrix,
      false,
      this.matrix.elements
    );

    // Send texture ID to shader
    gl.uniform1i(u_whichTexture, this.textureNum);

    // Front face
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]
    );

    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]
    );

    // Top face
    drawTriangle3DUVNormal(
      [0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
    );

    drawTriangle3DUVNormal(
      [0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
    );

    // Left face
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]
    );

    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0],
      [1.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]
    );

    // Right face
    drawTriangle3DUVNormal(
      [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    );

    drawTriangle3DUVNormal(
      [1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
      [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    );

    // Back face
    drawTriangle3DUVNormal(
      [0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 0.0, 0.0, 1.0],
      [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
    );

    drawTriangle3DUVNormal(
      [0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
    );

    // Bottom face
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
      [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]
    );

    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0],
      [0.0, 1.0, 1.0, 0.0, 1.0, 1.0],
      [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]
    );
  }
}