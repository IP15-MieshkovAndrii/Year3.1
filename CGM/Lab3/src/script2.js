const canvas2 = document.getElementById('perspectiveCanvas');
const gl2 = canvas2.getContext('webgl');

if (!gl2) {
    throw new Error('WebGL not supported');
}

const vertexData2 = [

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

function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}

let colorData2 = [];
for (let face = 0; face < 6; face++) {
    let faceColor = randomColor();
    for (let vertex = 0; vertex < 6; vertex++) {
        colorData2.push(...faceColor);
    }
}

const positionBuffer2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer2);
gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(vertexData2), gl2.STATIC_DRAW);

const colorBuffer2 = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer2);
gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(colorData2), gl2.STATIC_DRAW);

const vertexShader2 = gl2.createShader(gl2.VERTEX_SHADER);
gl2.shaderSource(vertexShader2, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix2;

void main() {
    vColor = color;
    gl_Position = matrix2 * vec4(position, 1);
}
`);
gl2.compileShader(vertexShader2);

const fragmentShader2 = gl2.createShader(gl2.FRAGMENT_SHADER);
gl2.shaderSource(fragmentShader2, `
precision mediump float;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1);
}
`);
gl2.compileShader(fragmentShader2);
console.log(gl2.getShaderInfoLog(fragmentShader2));

const program2 = gl2.createProgram();
gl2.attachShader(program2, vertexShader2);
gl2.attachShader(program2, fragmentShader2);

gl2.linkProgram(program2);

const positionLocation = gl2.getAttribLocation(program2, `position`);
gl2.enableVertexAttribArray(positionLocation);
gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer2);
gl2.vertexAttribPointer(positionLocation, 3, gl2.FLOAT, false, 0, 0);

const colorLocation = gl2.getAttribLocation(program2, `color`);
gl2.enableVertexAttribArray(colorLocation);
gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer2);
gl2.vertexAttribPointer(colorLocation, 3, gl2.FLOAT, false, 0, 0);

gl2.useProgram(program2);
gl2.enable(gl2.DEPTH_TEST);

const uniformLocations = {
    matrix2: gl2.getUniformLocation(program2, `matrix2`),
};

const matrix2 = mat4.create();
const projectionMatrix2 = mat4.create();
mat4.perspective(projectionMatrix2, 
    75 * Math.PI/180,
    canvas2.width/canvas2.height, 
    1e-4, 
    1e4
);

const finalMatrix2 = mat4.create();

mat4.translate(matrix2, matrix2, [.1, .1, -2]);

function animate() {
    requestAnimationFrame(animate);;
    mat4.rotateX(matrix2, matrix2, 0.01);
    mat4.rotateY(matrix2, matrix2, 0.01);
    mat4.rotateZ(matrix2, matrix2, 0.02);
    mat4.multiply(finalMatrix2, projectionMatrix2, matrix2);
    gl2.uniformMatrix4fv(uniformLocations.matrix2, false, finalMatrix2);
    gl2.drawArrays(gl2.TRIANGLES, 0, vertexData2.length / 3);
}

requestAnimationFrame(animate);