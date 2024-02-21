const canvas = document.getElementById("myPics");
const ctx = canvas.getContext("2d");
const canvasRect = canvas.getBoundingClientRect();

let drawMode = "point";
let vertices = []; 
let circleCenter = null; 
let drawCircle = false;

canvas.addEventListener("mousedown", (e) => {
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (drawMode == "point") {
        drawPoint(x, y);
    } else if (drawMode == "triangle"){
        vertices.push({ x, y });
        if (vertices.length === 3) {
            drawTriangle(vertices);
            vertices = [];
        }
    } else if (drawMode == "circle") {
        if (!circleCenter) {
            circleCenter = { x, y };
        } else {
            const radius = Math.sqrt(Math.pow(x - circleCenter.x, 2) + Math.pow(y - circleCenter.y, 2));
            drawCircleWithTriangleFan(circleCenter.x, circleCenter.y, radius);
            circleCenter = null;
        }
    }
});

const clearButton = document.getElementById("clearButton");
const colorSelect = document.getElementById("colorSelect");

const pointModeButton = document.getElementById("pointMode");
const triangleModeButton = document.getElementById("triangleMode");
const circleModeButton = document.getElementById("circleMode");

clearButton.addEventListener("click", clearCanvas);
colorSelect.addEventListener("change", changeDrawingColor);
pointModeButton.addEventListener("click", () => drawMode = "point");
triangleMode.addEventListener("click", () => drawMode = "triangle");
circleModeButton.addEventListener("click", () => drawMode = "circle");

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changeDrawingColor() {
    ctx.fillStyle = colorSelect.value;
    ctx.strokeStyle = colorSelect.value;
}

function drawPoint(x, y) {
    const pointSize = 5;
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawTriangle(vertices) {
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawCircleWithTriangleFan(centerX, centerY, radius) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    for (let i = 0; i <= 360; i += 10) {
        const angle = (i * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

changeDrawingColor();
