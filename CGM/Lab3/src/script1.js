const canvas1 = document.getElementById('orthographicCanvas');
const gl1 = canvas1.getContext('webgl');

if (!gl1) {
    throw new Error('WebGL not supported');
}

const vertexData = [
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];

const colorData = [];
function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}
for (let face = 0; face < 6; face++) {
    const faceColor = randomColor();
    for (let vertex = 0; vertex < 6; vertex++) {
        colorData.push(...faceColor);
    }
}

const positionBuffer1 = gl1.createBuffer();
gl1.bindBuffer(gl1.ARRAY_BUFFER, positionBuffer1);
gl1.bufferData(gl1.ARRAY_BUFFER, new Float32Array(vertexData), gl1.STATIC_DRAW);

const colorBuffer1 = gl1.createBuffer();
gl1.bindBuffer(gl1.ARRAY_BUFFER, colorBuffer1);
gl1.bufferData(gl1.ARRAY_BUFFER, new Float32Array(colorData), gl1.STATIC_DRAW);

const vertexShader1 = gl1.createShader(gl1.VERTEX_SHADER);
gl1.shaderSource(vertexShader1, `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix1;

    void main() {
        vColor = color;
        gl_Position = matrix1 * vec4(position, 1);
    }
`);
gl1.compileShader(vertexShader1);

const fragmentShader1 = gl1.createShader(gl1.FRAGMENT_SHADER);
gl1.shaderSource(fragmentShader1, `
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
`);
gl1.compileShader(fragmentShader1);

const program1 = gl1.createProgram();
gl1.attachShader(program1, vertexShader1);
gl1.attachShader(program1, fragmentShader1);

gl1.linkProgram(program1);

const positionLocation1 = gl1.getAttribLocation(program1, `position`);
gl1.enableVertexAttribArray(positionLocation1);
gl1.bindBuffer(gl1.ARRAY_BUFFER, positionBuffer1);
gl1.vertexAttribPointer(positionLocation1, 3, gl1.FLOAT, false, 0, 0);

const colorLocation1 = gl1.getAttribLocation(program1, `color`);
gl1.enableVertexAttribArray(colorLocation1);
gl1.bindBuffer(gl1.ARRAY_BUFFER, colorBuffer1);
gl1.vertexAttribPointer(colorLocation1, 3, gl1.FLOAT, false, 0, 0);

gl1.useProgram(program1);
gl1.enable(gl1.DEPTH_TEST);

const uniformLocations1 = {
    matrix1: gl1.getUniformLocation(program1, `matrix1`),
};

const matrix1 = mat4.create();
const projectionMatrix1 = mat4.create();
mat4.ortho(projectionMatrix1, -1, 1, -1, 1, 0.1, 100);

const finalMatrix1 = mat4.create();

mat4.lookAt(matrix1, [1, 1, 1], [0, 0, 0], [0, 1, 0]);

mat4.multiply(finalMatrix1, projectionMatrix1, matrix1);
gl1.uniformMatrix4fv(uniformLocations1.matrix1, false, finalMatrix1);

gl1.clearColor(1, 1, 1, 1);
gl1.clear(gl1.COLOR_BUFFER_BIT | gl1.DEPTH_BUFFER_BIT);

gl1.drawArrays(gl1.TRIANGLES, 0, vertexData.length / 3);
