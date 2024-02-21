const canvas = document.getElementById("myCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("Unable to initialize WebGL. Your browser may not support it.");
}

const vertices = [
    0.0, 0.0, 
    -0.5, -0.5,
    0.5, -0.5, 
    0.5, 0.5,
    -0.5, 0.5 
];


const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const numVertices = 5;

const vsSource = `
    attribute vec2 coordinates;
    void main(void) {
        gl_Position = vec4(coordinates, 0.0, 1.0);
    }
`;

const fsSource = `
    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const coord = gl.getAttribLocation(shaderProgram, "coordinates");

gl.enableVertexAttribArray(coord);

gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

let yTranslate = 0.0;
let direction = 1;

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.2, 0.4, 0.6, 1.0);
    yTranslate += 0.01 * direction;

    if (yTranslate > 0.5 || yTranslate < -0.5) {
        direction *= -1;
    }

    const vertices = [
        0.0, yTranslate,
        -0.5, -0.5 + yTranslate,
        0.5, -0.5 + yTranslate,
        0.5, 0.5 + yTranslate,
        -0.5, 0.5 + yTranslate
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
