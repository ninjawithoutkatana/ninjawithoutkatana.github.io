//APPLICATION?edufile.stopwatch/v0.1(#edufile7.0.0525)
var minutes = 0;
var seconds = 0;
var milliSec = 0;
var interval;
var index = 1;

var min = document.getElementById("min");
var sec = document.getElementById("sec");
var msec = document.getElementById("msec");
var stopBtn = document.getElementById("stopBtn");
var pauseBtn = document.getElementById("pauseBtn");
var lapBtn = document.getElementById("lapBtn");
var stopReset = document.getElementById("stopReset");
var myTable = document.getElementById("my-table");

var tbody = document.createElement("tbody");
myTable.appendChild(tbody);

function stopWatchTimer() {
    milliSec++;

    if (milliSec >= 100) {
        milliSec = 0;
        seconds++;
    }
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
    }

    min.innerHTML = `${minutes < 10 ? '0' + minutes : minutes}:`;
    sec.innerHTML = `${seconds < 10 ? '0' + seconds : seconds}:`;
    msec.innerHTML = `${milliSec < 10 ? '0' + milliSec : milliSec}`;
}

function startStopWatch() {
    clearInterval(interval);
    interval = setInterval(stopWatchTimer, 10);

    stopReset.disabled = false;
    pauseBtn.disabled = false;
    lapBtn.disabled = false;
    stopBtn.disabled = true;
}

function pauseStopWatch() {
    clearInterval(interval);
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
}

function reset() {
    clearInterval(interval);
    minutes = 0;
    seconds = 0;
    milliSec = 0;
    index = 1;

    min.innerHTML = "00:";
    sec.innerHTML = "00:";
    msec.innerHTML = "00";

    
    tbody.innerHTML = "";

    stopReset.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
    lapBtn.disabled = true;
}

function showLap() {
    let lapRow = `
     <tbody>
          <tr>
               <th>${index++})</th>
               <td>${minutes} мин</td>
               <td>${seconds} сек</td>
               <td>${milliSec} мс</td>
          </tr>
     </tbody>`;

    tbody.insertAdjacentHTML("beforeend", lapRow);
}