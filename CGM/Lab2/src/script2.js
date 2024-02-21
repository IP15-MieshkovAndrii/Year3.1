const canvas = document.getElementById("myPics");
const clearButton = document.getElementById("clearButton");
const colorSelect = document.getElementById("colorSelect");
const pointModeButton = document.getElementById("pointMode");
const triangleModeButton = document.getElementById("triangleMode");
const circleModeButton = document.getElementById("circleMode");
pointModeButton.classList.add("active");

const gl = canvas.getContext("webgl");
if (!gl) {
    alert("WebGL is not supported by your browser. Please use a WebGL-compatible browser.");
}

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 5.0;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
gl.enableVertexAttribArray(positionAttribute);

const colorUniform = gl.getUniformLocation(shaderProgram, "u_color");

let points = [];
let triangleVertices = [];
let circleVerticesFun = [];

let circleCenter = null;

canvas.addEventListener("mousedown", (event) => {
    const rect = event.target.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / canvas.width * 2 - 1;
    const mouseY = 1 - (event.clientY - rect.top) / canvas.height * 2;

    const color = getColor();

    if (pointModeButton.classList.contains("active")) {
        points.push({ x: mouseX, y: mouseY, color });
    } else if (triangleModeButton.classList.contains("active")) {
        triangleVertices.push({ x: mouseX, y: mouseY, color });
    } else if (circleModeButton.classList.contains("active")) {
        if (circleCenter === null) {
            circleCenter = { x: mouseX, y: mouseY, color };
        } else {
            const radius = Math.sqrt((mouseX - circleCenter.x) ** 2 + (mouseY - circleCenter.y) ** 2);
            const circleVertices = [];
            const segments = 36;
            for (let i = 0; i < segments; i++) {

                const angle = (i / segments) * Math.PI * 2;
                const x = circleCenter.x + radius * Math.cos(angle);
                const y = circleCenter.y + radius * Math.sin(angle);
                circleVertices.push(x, y);
            }
            circleVerticesFun.push({circle: [...circleVertices], color});
            circleCenter = null;
        }
    }

    draw();
});


clearButton.addEventListener("click", () => {
    points = [];
    triangleVertices = [];
    circleVerticesFun = [];
    draw();
});

pointModeButton.addEventListener("click", () => {
    pointModeButton.classList.add("active");
    triangleModeButton.classList.remove("active");
    circleModeButton.classList.remove("active");
});

triangleModeButton.addEventListener("click", () => {
    pointModeButton.classList.remove("active");
    triangleModeButton.classList.add("active");
    circleModeButton.classList.remove("active");
});

circleModeButton.addEventListener("click", () => {
    pointModeButton.classList.remove("active");
    triangleModeButton.classList.remove("active");
    circleModeButton.classList.add("active");
});



function draw() {
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    drawPoints()
    drawTriangles()
    drawCircles();
}

function drawPoints() {
    points.forEach((point) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([point.x, point.y]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(colorUniform, new Float32Array(point.color));
        gl.drawArrays(gl.POINTS, 0, 1);
    });
}

function drawTriangles() {
    if (triangleVertices.length >= 3) {
        let shapes = []
        let vertices = [];
        let trianglesOnly = triangleVertices.length%3;
        for (let i = 0; i < triangleVertices.length-trianglesOnly; i += 3) {
            vertices.push(triangleVertices[i].x, triangleVertices[i].y);
            vertices.push(triangleVertices[i + 1].x, triangleVertices[i + 1].y);
            vertices.push(triangleVertices[i + 2].x, triangleVertices[i + 2].y);

            shapes.push({vertices, color: triangleVertices[i + 2].color})
            vertices = [];
        }
        shapes.forEach((shape) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.uniform4fv(colorUniform, new Float32Array(shape.color));
            gl.drawArrays(gl.TRIANGLES, 0, shape.vertices.length / 2);
        });
    }
}

function drawCircles() {
        circleVerticesFun.forEach((circle) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle.circle), gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.uniform4fv(colorUniform, new Float32Array(circle.color));
            gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.circle.length / 2);
        });

}

function colorToRgb(colorName) {
    switch (colorName) {
        case 'red':
            return [1.0, 0.0, 0.0, 1.0];
        case 'black':
            return [0.0, 0.0, 0.0, 1.0];
        case 'blue':
            return [0.0, 0.0, 1.0, 1.0];
        case 'green':
            return [0.0, 1.0, 0.0, 1.0];
        default:
            return [0.0, 0.0, 0.0, 1.0];
    }
}

function getColor() {
    return colorToRgb(colorSelect.value);
}

draw();

