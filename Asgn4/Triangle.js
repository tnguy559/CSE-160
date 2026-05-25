class Triangle {
  constructor() {
    // Shape type identifier
    this.type = 'triangle';

    // Default RGBA color (white)
    this.color = [1.0, 1.0, 1.0, 1.0];

    // Flag for cat drawing mode
    this.drawCat = false;
  }

  // Render the triangle
  render() {
    const rgba = this.color;

    // Send color to fragment shader
    gl.uniform4f(
      u_FragColor,
      rgba[0],
      rgba[1],
      rgba[2],
      rgba[3]
    );

    // Pass point size to shader
    gl.uniform1f(u_Size, size);

    // Calculate triangle offset size
    const d = this.size / 200.0;

    // Draw triangle using vertex positions
    drawTriangle([
      xy[0], xy[1],
      xy[0] + d, xy[1],
      xy[0], xy[1] + d
    ]);
  }
}

function drawTriangle(vertices) {
  // Number of vertices in triangle
  const n = 3;

  // Create vertex buffer
  const vertexBuffer = gl.createBuffer();

  // Stop if buffer creation fails
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind buffer and send vertex data to GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  );

  // Connect buffer to position attribute
  gl.vertexAttribPointer(
    a_Position,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Enable position attribute
  gl.enableVertexAttribArray(a_Position);

  // Draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  // Number of vertices in triangle
  const n = 3;

  // Create vertex buffer
  const vertexBuffer = gl.createBuffer();

  // Stop if buffer creation fails
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind buffer and upload 3D vertex data
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  );

  // Connect buffer to position attribute
  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Enable position attribute
  gl.enableVertexAttribArray(a_Position);

  // Draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  // Number of vertices in triangle
  const n = 3;

  // Create vertex buffer
  const vertexBuffer = gl.createBuffer();

  // Stop if buffer creation fails
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind vertex buffer and upload vertex data
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  );

  // Connect vertex data to position attribute
  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Enable position attribute
  gl.enableVertexAttribArray(a_Position);

  // Create UV buffer for texture coordinates
  const uvBuffer = gl.createBuffer();

  // Stop if UV buffer creation fails
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind UV buffer and upload texture coordinates
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(uv),
    gl.STATIC_DRAW
  );

  // Connect UV buffer to shader
  gl.vertexAttribPointer(
    a_UV,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Enable UV attribute
  gl.enableVertexAttribArray(a_UV);

  // Draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV_All(vertices, uvs) {
  // Calculate total vertex count
  const n = vertices.length / 3;

  // Create vertex buffer
  const vertexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Upload vertex data
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.DYNAMIC_DRAW
  );

  // Connect position attribute
  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_Position);

  // Create UV buffer
  const uvBuffer = gl.createBuffer();

  // Upload UV data
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    uvs,
    gl.DYNAMIC_DRAW
  );

  // Connect UV attribute
  gl.vertexAttribPointer(
    a_UV,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_UV);

  // Draw geometry
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
  // Calculate total number of vertices
  const n = vertices.length / 3;

  // Create vertex buffer
  const vertexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Upload vertex position data
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.DYNAMIC_DRAW
  );

  // Connect position attribute
  gl.vertexAttribPointer(
    a_Position,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_Position);

  // Create UV buffer
  const uvBuffer = gl.createBuffer();

  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Upload UV texture coordinates
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(uv),
    gl.DYNAMIC_DRAW
  );

  // Connect UV attribute
  gl.vertexAttribPointer(
    a_UV,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_UV);

  // Create buffer for lighting normals
  const normalBuffer = gl.createBuffer();

  if (!normalBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Upload normal data
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.DYNAMIC_DRAW
  );

  // Connect normal attribute
  gl.vertexAttribPointer(
    a_Normal,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(a_Normal);

  // Draw triangles
  gl.drawArrays(gl.TRIANGLES, 0, n);
}