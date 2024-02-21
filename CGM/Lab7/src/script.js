document.addEventListener("DOMContentLoaded", function () {
    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    // Fragment shader program
    const fsSource = `
        precision mediump float;
        void main(void) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5); // translucent black
        }
    `;

    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function initBuffers(gl) {
        // Create a buffer for the rectangle's vertex positions
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            // Large Rectangle (Earth)
            -1.0, -1.0,
            1.0, -1.0,
            1.0, 1.0,
            -1.0, 1.0,

            // Small Rectangle 1
            -0.5, -0.5,
            0.5, -0.5,
            0.5, 0.5,
            -0.5, 0.5,

            // Small Rectangle 2
            -0.7, -0.7,
            -0.5, -0.7,
            -0.5, -0.5,
            -0.7, -0.5,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        return {
            position: positionBuffer,
        };
    }

    function drawScene(gl, programInfo, buffers) {
        gl.clearColor(0.8, 0.8, 0.8, 1.0); // Set the background color to light gray
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180; // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();

        // Set the drawing position to the "identity" point, which is the center of the scene.
        mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);

        // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            const offset = 0;         // how many bytes inside the buffer to start from

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);  // Draw Earth

            // Draw Small Rectangle 1
            gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);

            // Draw Small Rectangle 2
            gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
        }
    }

    function main() {
        const canvas = document.getElementById("myCanvas");
        const gl = canvas.getContext("webgl");

        if (!gl) {
            throw new Error('WebGL not supported');
        }

        // Initialize shaders
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        // Initialize buffers
        const buffers = initBuffers(gl);

        // Draw the scene
        drawScene(gl, programInfo, buffers);
    }

    main();
});
