//APPLICATION?edufile.timer/v0.1(#edufile6.2.prerelease.0325)
var tSpan = document.getElementById("tspan");
tSpan.innerHTML = `0 : 00`;

var tStart = document.getElementById("tstart");
var tEnd = document.getElementById("tend");
var beep = document.getElementById("beep");
var tInput = document.getElementById("timerInput");
var tInstr = document.getElementById("tIns");
var tInstrValue = `<h3>Нұсқаулар:</h3>
                <ol>
                    <li>Жоғарыдағы өріске таймердің уақытын енгізіңіз (минут).</li>
                    <li>Таймердің уақыты шектелген, 1 минуттан бастап 59 минут аралығына есептелген.</li>
                </ol>`;
tInstr.innerHTML = tInstrValue;

var time = 0;
var timerStatus = false;
var timeInterval;

function updateTimerDisplay() {
    var timerMinutes = Math.floor(time / 60);
    var timerSeconds = time % 60;
    tSpan.innerHTML = `${timerMinutes} : ${timerSeconds < 10 ? "0" + timerSeconds : timerSeconds}`;
}

function timer() {
    if (time <= 0) {
        clearInterval(timeInterval);
        tSpan.innerHTML = `0 : 00`;
        beep.play();
        resetTimer();
        return;
    }
    
    tInstr.innerHTML = ``;
    updateTimerDisplay();
    time--;
}

function startTimer() {
    if (!timerStatus) {
        if (time <= 0) {
            time = parseInt(tInput.value, 10) * 60;
            if (isNaN(time) || time <= 0) return;
        }

        tStart.innerText = "Кідіру";
        tStart.disabled = false;
        tEnd.disabled = false;
        timerStatus = true;

        updateTimerDisplay();
        timeInterval = setInterval(timer, 1000);
        beep.pause();
    } else {
        pauseTimer();
        tStart.innerText = "Бастау";
        timerStatus = false;
    }
}

function resetTimer() {
    clearInterval(timeInterval);
    time = 0;
    tSpan.innerHTML = `0 : 00`;
    tStart.innerText = "Бастау";
    tStart.disabled = false;
    tEnd.disabled = true;
    timerStatus = false;
    tInstr.innerHTML = tInstrValue;
}

function pauseTimer() {
    clearInterval(timeInterval);
    timerStatus = false;
}