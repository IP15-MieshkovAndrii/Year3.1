let canvas;
let gl;
let program1, program2;
let crateMatrix, lidMatrix;
let perspectiveMatrix;
let finalMatrix, lidFinalMatrix;
let crateLoc, lidLoc;

let uniformLocations = {crateMatrix: [], lidMatrix: []};

let rotationAngleY = 30.0;
let lidOpen = false;

let vertexData, lidVertexData;

function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
}

function initGL_1() {

    vertexData = [
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

    let colorData = [];
    for (let face = 0; face < 6; face++) {
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++) {
            colorData.push(...faceColor);
        }
    }
    const positionBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    const colorBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    program1 = gl.createProgram();
    gl.attachShader(program1, vertexShader);
    gl.attachShader(program1, fragmentShader);

    gl.linkProgram(program1);

    const positionLocation1 = gl.getAttribLocation(program1, `position`);
    gl.enableVertexAttribArray(positionLocation1);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
    gl.vertexAttribPointer(positionLocation1, 3, gl.FLOAT, false, 0, 0);

    const colorLocation1 = gl.getAttribLocation(program1, `color`);
    gl.enableVertexAttribArray(colorLocation1);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer1);
    gl.vertexAttribPointer(colorLocation1, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program1);
    gl.enable(gl.DEPTH_TEST);

    uniformLocations.crateMatrix = gl.getUniformLocation(program1, `matrix`)

    crateMatrix = mat4.create();

    finalMatrix = mat4.create();

    let loc = [1,1,-3];
    setPerspectiveProjection(loc)

    mat4.translate(crateMatrix, crateMatrix, [0, 0, -3]);

}
function initGL_2() {
    lidVertexData = [
        0.5, 0.5, 0.5,
        0.5, 0.48, 0.5,
        -.5, 0.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, 0.48, 0.5,
        -.5, 0.48, 0.5,
    
        -.5, 0.5, 0.5,
        -.5, 0.48, 0.5,
        -.5, 0.5, -.5,
        -.5, 0.5, -.5,
        -.5, 0.48, 0.5,
        -.5, 0.48, -.5,
    
        -.5, 0.5, -.5,
        -.5, 0.48, -.5,
        0.5, 0.5, -.5,
        0.5, 0.5, -.5,
        -.5, 0.48, -.5,
        0.5, 0.48, -.5,
    
        0.5, 0.5, -.5,
        0.5, 0.48, -.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.48, 0.5,
        0.5, 0.48, -.5,
    
        0.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, 0.5, -.5,
        -.5, 0.5, -.5,
    
        0.5, 0.48, 0.5,
        0.5, 0.48, -.5,
        -.5, 0.48, 0.5,
        -.5, 0.48, 0.5,
        0.5, 0.48, -.5,
        -.5, 0.48, -.5,
    ];


    let colorData = [];
    for (let face = 0; face < 6; face++) {
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++) {
            colorData.push(...faceColor);
        }
    }
    const positionBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lidVertexData), gl.STATIC_DRAW);

    const colorBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;

    uniform mat4 matrix;

    void main() {
        vColor = color;
        gl_Position = matrix * vec4(position, 1);
    }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
    `);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    program2 = gl.createProgram();
    gl.attachShader(program2, vertexShader);
    gl.attachShader(program2, fragmentShader);

    gl.linkProgram(program2);

    const positionLocation2 = gl.getAttribLocation(program2, 'position');
    gl.enableVertexAttribArray(positionLocation2);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer2);
    gl.vertexAttribPointer(positionLocation2, 3, gl.FLOAT, false, 0, 0);

    const colorLocation2 = gl.getAttribLocation(program2, `color`);
    gl.enableVertexAttribArray(colorLocation2);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer2);
    gl.vertexAttribPointer(colorLocation2, 3, gl.FLOAT, false, 0, 0);

    uniformLocations.lidMatrix = gl.getUniformLocation(program2, `matrix`);

    lidMatrix = mat4.create();

    lidFinalMatrix = mat4.create();

    let loc = [0, 0, -3];
    setPerspectiveProjection(loc)

    mat4.translate(lidMatrix, lidMatrix, [0, 0, -3]);
}


function drawCrate() {
    gl.useProgram(program1);
    gl.enable(gl.DEPTH_TEST);
    mat4.multiply(finalMatrix, perspectiveMatrix, crateMatrix);
    gl.uniformMatrix4fv(uniformLocations.crateMatrix, false, finalMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    
}

function drawLid() {
    gl.useProgram(program2);
    gl.enable(gl.DEPTH_TEST);
    mat4.multiply(lidFinalMatrix, perspectiveMatrix, lidMatrix);
    gl.uniformMatrix4fv(uniformLocations.lidMatrix, false, lidFinalMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, lidVertexData.length / 3);

}


function rotateY(thetaY, matrix) {

}


function setPerspectiveProjection(loc) {

    let cameraPosition = loc;

    // mat4.lookAt(lidMatrix, [0,1,2], [0, 0, 0], [0, 1, 0]);


    perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 
        75 * Math.PI/180,
        canvas.width/canvas.height,
        1e-4,
        1e4
    );

}

function passAttribData(data, attBuffer, loc) {

}

function handleKeyPress(event) {

}

function updateScene() {

}

function render() {

    drawCrate();
    drawLid();

    requestAnimationFrame(render);
}

window.addEventListener('keydown', handleKeyPress);

window.onload = function () {
    canvas = document.getElementById('myCanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    initGL_1();
    initGL_2();
    render();
}
