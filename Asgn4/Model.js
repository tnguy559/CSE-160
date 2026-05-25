class Model {
    constructor(gl, filePath) {
        // Store file path for loading the model
        this.filePath = filePath;

        // Default model color (pink tint)
        this.color = [1.0, 0.7, 1.0, 1.0];

        // Transformation matrix for position, scale, and rotation
        this.matrix = new Matrix4();

        // Tracks whether model data has fully loaded
        this.isFullyLoaded = false;

        // Default texture number (-2 usually means no texture)
        this.textureNum = -2;

        // Load model file and create buffers once ready
        this.getFileContent().then(() => {
            this.vertexBuffer = gl.createBuffer();
            this.normalBuffer = gl.createBuffer();

            // Check if buffer creation succeeded
            if (!this.vertexBuffer || !this.normalBuffer) {
                console.log("Failed to create buffers for", this.filePath);
                return;
            }
        });
    }

    // Parses OBJ file content into vertex and normal arrays
    async parseModel(fileContent) {
        const lines = fileContent.split("\n");

        // Stores raw vertex and normal data from the OBJ file
        const allVertices = [];
        const allNormals = [];

        // Stores expanded vertex and normal data for rendering
        const unpackedVerts = [];
        const unpackedNormals = [];

        // Read file line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const tokens = line.split(" ");

            // Vertex position data
            if (tokens[0] === "v") {
                allVertices.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            }

            // Vertex normal data
            else if (tokens[0] === "vn") {
                allNormals.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            }

            // Face data (triangles)
            else if (tokens[0] === "f") {
                for (const face of [tokens[1], tokens[2], tokens[3]]) {
                    const indices = face.split("//");

                    // Convert OBJ indices to array positions
                    const vertexIndex = (parseInt(indices[0]) - 1) * 3;
                    const normalIndex = (parseInt(indices[1]) - 1) * 3;

                    // Add vertex coordinates
                    unpackedVerts.push(
                        allVertices[vertexIndex],
                        allVertices[vertexIndex + 1],
                        allVertices[vertexIndex + 2]
                    );

                    // Add corresponding normal coordinates
                    unpackedNormals.push(
                        allNormals[normalIndex],
                        allNormals[normalIndex + 1],
                        allNormals[normalIndex + 2]
                    );
                }
            }
        }

        // Convert arrays into Float32Arrays for WebGL
        this.modelData = {
            vertices: new Float32Array(unpackedVerts),
            normals: new Float32Array(unpackedNormals)
        };

        // Mark model as ready for rendering
        this.isFullyLoaded = true;
    }

    // Renders the model to the WebGL canvas
    render() {
        // Skip rendering if model is not ready
        if (!this.isFullyLoaded) return;

        // Send vertex data to GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.modelData.vertices,
            gl.DYNAMIC_DRAW
        );

        gl.vertexAttribPointer(
            a_Position,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(a_Position);

        // Send normal data for lighting calculations
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.modelData.normals,
            gl.DYNAMIC_DRAW
        );

        gl.vertexAttribPointer(
            a_Normal,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(a_Normal);

        // Send transformation matrix and rendering settings
        gl.uniformMatrix4fv(
            u_ModelMatrix,
            false,
            this.matrix.elements
        );

        gl.uniform4fv(u_FragColor, this.color);
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Create and send normal matrix for lighting
        const normalMatrix = new Matrix4()
            .setInverseOf(this.matrix)
            .transpose();

        gl.uniformMatrix4fv(
            u_NormalMatrix,
            false,
            normalMatrix.elements
        );

        // Disable UV attribute since this model uses normals only
        gl.disableVertexAttribArray(a_UV);

        // Draw the model as triangles
        gl.drawArrays(
            gl.TRIANGLES,
            0,
            this.modelData.vertices.length / 3
        );
    }

    // Loads model file content using fetch
    async getFileContent() {
        try {
            const response = await fetch(this.filePath);

            // Check if file loaded correctly
            if (!response.ok) {
                throw new Error(
                    `Could not load file "${this.filePath}". Are you sure the file name/path are correct?`
                );
            }

            // Convert file into text and parse model
            const fileContent = await response.text();
            this.parseModel(fileContent);

        } catch (e) {
            throw new Error(
                `Something went wrong when loading ${this.filePath}. Error: ${e}`
            );
        }
    }
}