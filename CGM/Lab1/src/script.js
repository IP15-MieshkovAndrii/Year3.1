function setupWebGL(canvasId) {
    let canvas = document.getElementById(canvasId);
    let gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL не підтримується, перевірте ваш браузер.');
        return null;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.4, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking failed:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function windowOnLoad() {
    let gl;
    let shaderProgram;
    let triangleRotation = 0.0;
    gl = setupWebGL('myCanvas');
    if (!gl) return;

    let vsSource = `
        attribute vec4 coordinates;
        attribute vec4 vertexColor;
        varying lowp vec4 varyingColor;
        void main(void) {
            gl_Position = coordinates;
            varyingColor = vertexColor;
        }`;

    let fsSource = `
        varying lowp vec4 varyingColor;
        void main(void) {
            gl_FragColor = varyingColor;
        }`;

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);


    let vertices = new Float32Array([

        -0.5,  0.5,  1.0, 0.0, 0.0, 
        -0.5, -0.5,  0.0, 1.0, 0.0,
         0.5, -0.5,  0.0, 0.0, 1.0, 
    

        -0.5,  0.5,  0.0, 1.0, 1.0, 
         0.5,  0.5,  1.0, 1.0, 0.0, 
         0.5, -0.5,  1.0, 0.0, 1.0 
    ]);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(coord);

    let color = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 20, 8);
    gl.enableVertexAttribArray(color);

    function rotateVertex(x, y, cosTheta, sinTheta) {
        let newX = cosTheta * x - sinTheta * y;
        let newY = sinTheta * x + cosTheta * y;
        
        return [newX, newY];
    }

    function drawTriangles() {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function animateTriangles() {
        triangleRotation += 0.01;

        gl.clear(gl.COLOR_BUFFER_BIT);

        let cosTheta = Math.cos(triangleRotation);
        let sinTheta = Math.sin(triangleRotation);
    
        let vertices = new Float32Array([
            ...rotateVertex(-0.5,  0.5, cosTheta, sinTheta),1.0, 0.0, 0.0,
            ...rotateVertex(-0.5,  -0.5, cosTheta, sinTheta),0.0, 1.0, 0.0,
            ...rotateVertex(0.5,  -0.5, cosTheta, sinTheta),0.0, 0.0, 1.0,
    
            ...rotateVertex(-0.5,  0.5, cosTheta, sinTheta),0.0, 1.0, 1.0,
            ...rotateVertex(0.5,  0.5, cosTheta, sinTheta),1.0, 1.0, 0.0,
            ...rotateVertex(0.5,  -0.5, cosTheta, sinTheta), 1.0, 0.0, 1.0
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        drawTriangles();

        requestAnimationFrame(animateTriangles);
    }

    requestAnimationFrame(animateTriangles);
}

window.onload = windowOnLoad;
