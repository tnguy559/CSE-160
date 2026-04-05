function drawVector(v, color) {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    var cx = canvas.width / 2;
    var cy = canvas.height / 2;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + v.elements[0] * 20, cy - v.elements[1] * 20);
    ctx.stroke();
}

function clearCanvas() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function readV1() {
    var x = parseFloat(document.getElementById('v1x').value);
    var y = parseFloat(document.getElementById('v1y').value);
    return new Vector3([x, y, 0]);
}

function readV2() {
    var x = parseFloat(document.getElementById('v2x').value);
    var y = parseFloat(document.getElementById('v2y').value);
    return new Vector3([x, y, 0]);
}

function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x = parseFloat(document.getElementById('v1x').value);
    var y = parseFloat(document.getElementById('v1y').value);
    var v1 = new Vector3([x, y, 0]);

    drawVector(v1, "red");
}

function handleDrawOperationEvent() {
    clearCanvas();

    var v1 = readV1();
    var v2 = readV2();

    drawVector(v1, "red");
    drawVector(v2, "blue");

    var op = document.getElementById('operation').value;
    var s  = parseFloat(document.getElementById('scalar').value);

    if (op === 'add') {
        var v3 = new Vector3(v1.elements).add(v2);
        drawVector(v3, "green");
    } else if (op === 'sub') {
        var v3 = new Vector3(v1.elements).sub(v2);
        drawVector(v3, "green");
    } else if (op === 'mul') {
        var v3 = new Vector3(v1.elements).mul(s);
        var v4 = new Vector3(v2.elements).mul(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (op === 'div') {
        var v3 = new Vector3(v1.elements).div(s);
        var v4 = new Vector3(v2.elements).div(s);
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (op === 'normalize') {
        console.log("Magnitude v1: " + v1.magnitude());
        console.log("Magnitude v2: " + v2.magnitude());
        var v3 = new Vector3(v1.elements).normalize();
        var v4 = new Vector3(v2.elements).normalize();
        drawVector(v3, "green");
        drawVector(v4, "green");
    } else if (op === 'angleBetween') {
        var angle = angleBetween(v1, v2);
        console.log("Angle between v1 and v2: " + angle + " degrees");
    } else if (op === 'area') {
        var area = areaTriangle(v1, v2);
        console.log("Area of the triangle: " + area);
    }
}

function areaTriangle(v1, v2) {
    var cross = Vector3.cross(v1, v2);
    return cross.magnitude() / 2;
}

function main() {

    // Retrieve <canvas> element
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG 11 var ctx = canvas.getContext('2d');
    var ctx = canvas.getContext('2d');

    // Fill canvas black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Instantiate v1 with Vector3 (z = 0)
    var v1 = new Vector3([2.25, 2.25, 0]);

    drawVector(v1, "red");
}