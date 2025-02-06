/* APPLICATION?edufile.wheelofnames/v0.1(#edufile6.0.0125) */
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const namesInput = document.getElementById("namesInput");
const resultDisplay = document.getElementById("result");

let names = [];
let startAngle = 0;
let arc;
let spinTimeout;
let spinAngleStart = Math.random() * 10 + 10;
let spinTime = 0;
let spinTimeTotal = 0;
let spinning = false;
let pointerOffset = 0;
let pointerDirection = 1;

// Draw the wheel
function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    names.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, angle, angle + arc, false);
        ctx.lineTo(radius, radius);
        ctx.fillStyle = `hsl(${(i * 360) / names.length}, 70%, 70%)`;
        ctx.fill();
        ctx.save();
        ctx.translate(radius + Math.cos(angle + arc / 2) * (radius / 2), radius + Math.sin(angle + arc / 2) * (radius / 2));
        ctx.rotate(angle + arc / 2);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(name, -ctx.measureText(name).width / 2, 5);
        ctx.restore();
    });

    // Draw the center circle
    ctx.beginPath();
    ctx.arc(radius, radius, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();



    // Draw the pointer with offset
    ctx.beginPath();
    ctx.moveTo(radius - 10 + pointerOffset, 0);
    ctx.lineTo(radius + 10 + pointerOffset, 0);
    ctx.lineTo(radius + pointerOffset, 50);
    ctx.fillStyle = "red";
    ctx.fill();
}


// Rotate the wheel
function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - (easeOut(spinTime, 0, spinAngleStart, spinTimeTotal));
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

// Stop the wheel
function stopRotateWheel() {
    clearTimeout(spinTimeout);
    spinning = false;

    // Calculate the angle in degrees
    const degrees = (startAngle * 180 / Math.PI) % 360;
    const adjustedDegrees = (360 - degrees) % 360; // Adjust for clockwise direction
    const index = Math.floor(adjustedDegrees / (360 / names.length));

}

// Ease out function
function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

// Spin the wheel
spinButton.addEventListener("click", () => {
    if (spinning) return;
    names = namesInput.value.split(",").map(name => name.trim()).filter(name => name);
    if (names.length < 2) {
        resultDisplay.textContent = "Кемінде екі оқушы есімін енгізіңіз.";
        return;
    }
    resultDisplay.textContent = "";
    arc = (2 * Math.PI) / names.length;
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 2000;
    spinning = true;
    drawWheel();
    rotateWheel();
});

// Initial setup
names = [" ", " ", " ", " ", " "];
arc = (2 * Math.PI) / names.length;
drawWheel();