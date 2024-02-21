const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}

const vertexData = [

    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,

    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,

    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,

    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
];

function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}

const normalData = [
    ...repeat(6, [0, 0, 1]),   
    ...repeat(6, [-1, 0, 0]),   
    ...repeat(6, [0, 0, -1]), 
    ...repeat(6, [1, 0, 0]),  
    ...repeat(6, [0, 1, 0]), 
    ...repeat(6, [0, -1, 0]),
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

function shaderProgram() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        precision mediump float;

        const vec3 lightDirection = normalize(vec3(0,1,1));
        const float ambient = 0.5;

        attribute vec3 position;
        attribute vec3 normal;

        varying float vBrightness;

        uniform mat4 matrix;
        uniform mat4 normalMatrix;

        void main() {
            vec3 worldNormal = (normalMatrix * vec4(normal, 1)).xyz;
            float diffuse = max(0.0, dot(worldNormal, lightDirection));

            vec3 reflectDir = reflect(-lightDirection, worldNormal);

            float specular = pow(max(0.0, dot(reflectDir, lightDirection)), 32.0);
            
            vBrightness = ambient + diffuse + specular;

            gl_Position = matrix * vec4(position, 1);
        }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision mediump float;

        varying float vBrightness;

        void main() {
            gl_FragColor = vec4(0, 0.8, 0, 1.0) * vBrightness;
        }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const normalLocation = gl.getAttribLocation(program, 'normal');
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    return {
        program,
        uniformLocations: {
            matrix: gl.getUniformLocation(program, 'matrix'),
            normalMatrix: gl.getUniformLocation(program, 'normalMatrix'),
        },
    };
}

const { program, uniformLocations } = shaderProgram();

const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 
    75 * Math.PI / 180,
    canvas.width / canvas.height,
    1e-4,
    1e4
);

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
mat4.invert(viewMatrix, viewMatrix);

const normalMatrix = mat4.create();

function render() {
    requestAnimationFrame(render);

    mat4.rotateY(modelMatrix, modelMatrix, 0.6/100);
    mat4.rotateX(modelMatrix, modelMatrix, 0.5/100);

    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    mat4.invert(normalMatrix, mvMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

render();
