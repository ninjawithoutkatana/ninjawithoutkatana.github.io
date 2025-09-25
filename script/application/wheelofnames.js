//APPLICATION?edufile.wheelofnames/v3.4(#edufile7.0.0525)
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const namesInput = document.getElementById("namesInput");
const resultDisplay = document.getElementById("result");
const removeWinnerButton = document.getElementById("removeWinnerButton");
const toggleSoundButton = document.getElementById("toggleSoundButton");
const tickSound = document.getElementById("tickSound");
const winnerSound = document.getElementById("winnerSound");
const toggleWinnersBtn = document.getElementById("toggleWinnersBtn");
const winnersSection = document.getElementById("winnersSection");
const winnersListEl = document.getElementById("winnersList");
let winnersList = [];
let winnersVisible = false;
let names = [];
let startAngle = 0;
let arc;
let spinTimeout;
let spinAngleStart = Math.random() * 10 + 10;
let spinTime = 0;
let spinTimeTotal = 0;
let spinning = false;
let currentWinner = null;
let soundEnabled = true;
let lastIndex = -1;

function drawWheel() {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  names.forEach((name, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, angle, angle + arc, false);
    ctx.lineTo(radius, radius);
    ctx.fillStyle = `hsl(${(i * 360) / names.length}, 70%, 70%)`;
    ctx.fill();
    ctx.save();
    ctx.translate(
      radius + Math.cos(angle + arc / 2) * (radius / 2),
      radius + Math.sin(angle + arc / 2) * (radius / 2)
    );
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "black";
    ctx.font = "16px PlumbKaz";
    ctx.fillText(name, -ctx.measureText(name).width / 2, 5);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(radius, radius, 20, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(radius, 50);
  ctx.lineTo(radius - 10, 0);
  ctx.lineTo(radius + 10, 0);
  ctx.closePath();
  ctx.fillStyle = "red";
  ctx.fill();
}

function rotateWheel() {
  spinTime += 30;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }

  const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI) / 180;

  drawWheel();

  const degrees = (startAngle * 180 / Math.PI) % 360;
  const adjustedDegrees = (degrees + 90) % 360;
  const currentIndex = Math.floor((360 - adjustedDegrees) / (360 / names.length)) % names.length;

  if (currentIndex !== lastIndex) {
    if (soundEnabled) {
      try {
        tickSound.currentTime = 0;
        tickSound.play();
      } catch (e) {}
    }
    lastIndex = currentIndex;
  }

  spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  spinning = false;

  const degrees = (startAngle * 180 / Math.PI) % 360;
  const adjustedDegrees = (degrees + 90) % 360;
  const index = Math.floor((360 - adjustedDegrees) / (360 / names.length)) % names.length;
  const winner = names[index];
  currentWinner = winner;
  winnersList.push(winner);
  winnersSection.style.display = "block";

  const li = document.createElement("li");
  li.textContent = winner;
  winnersListEl.appendChild(li);

  if (winnersList.length === 1) {
    toggleWinnersBtn.style.display = "inline-block";
  }
  if (winnersVisible) {
    winnersSection.style.maxHeight = winnersSection.scrollHeight + "px";
  }



  removeWinnerButton.disabled = false;

  resultDisplay.innerHTML = `<h1 style="font-size: 34px; line-height: 1em;">${winner} 🎉</h1>`;

  if (soundEnabled) {
    try {
      winnerSound.currentTime = 0;
      winnerSound.play();
    } catch (e) {
      console.log("Winner sound error:", e);
    }
  }
}

function easeOut(t, b, c, d) {
  const ts = (t /= d) * t;
  const tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

spinButton.addEventListener("click", () => {
  if (spinning) return;
  names = namesInput.value
    .split(",")
    .map(name => name.trim())
    .filter(name => name);
  if (names.length < 2) {
    resultDisplay.innerHTML = `<h1 style="font-size: 34px; line-height: 1em; color: red">Кемінде екі оқушы есімін енгізіңіз.</h1>`;
    return;
  }
  resultDisplay.innerHTML = `<h1 style="font-size: 34px"><i class="fas fa-sync-alt"></i></h1>`;
  arc = (2 * Math.PI) / names.length;
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3000 + 2000;
  spinning = true;
  removeWinnerButton.disabled = true;
  drawWheel();
  rotateWheel();
});

removeWinnerButton.addEventListener("click", () => {
  if (currentWinner) {
    names = names.filter(name => name !== currentWinner);
    namesInput.value = names.join(", ");
    currentWinner = null;
    resultDisplay.innerHTML = `<h1 style="font-size: 34px"><i class="fas fa-minus"></i></h1>`;
    if (names.length < 2) {
      resultDisplay.innerHTML = `<h1 style="font-size: 34px; line-height: 1em; color: red">Кемінде екі оқушы қалу керек.</h1>`;
    }
    arc = (2 * Math.PI) / names.length;
    drawWheel();
    removeWinnerButton.disabled = true;
  }
});

toggleSoundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  toggleSoundButton.innerHTML = soundEnabled ? `<i class="fa-solid fa-volume-high"></i> Дыбыс қосулы` : `<i class="fa-solid fa-volume-xmark"></i> Дыбыс өшірулі`;
});

toggleWinnersBtn.addEventListener("click", () => {
  winnersVisible = !winnersVisible;
  if (winnersVisible) {
    winnersSection.style.maxHeight = winnersSection.scrollHeight + "px";
    toggleWinnersBtn.innerHTML = `<i class="fa-solid fa-angle-up"></i> Жеңімпаздар тізімін жасыру`;
  } else {
    winnersSection.style.maxHeight = "0";
    toggleWinnersBtn.innerHTML = `<i class="fa-solid fa-angle-down"></i> Жеңімпаздар тізімін көрсету`;
  }
});

names = [" ", " ", " ", " ", " "];
arc = (2 * Math.PI) / names.length;
drawWheel();