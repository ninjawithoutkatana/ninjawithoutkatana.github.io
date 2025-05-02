//APPLICATION?edufile.scorekeeper/v0.1(#edufile6.3.0525)
let time = 0,
     interval;

function startTimer() {
     if (!interval) {
          interval = setInterval(() => {
               time++;
               document.getElementById('time').innerText = new Date(time * 1000).toISOString()
                    .substr(14, 5);
          }, 1000);
          document.getElementById('startBtn').disabled = true;
          document.getElementById('pauseBtn').disabled = false;
     }
}

function pauseTimer() {
     clearInterval(interval);
     interval = null;
     document.getElementById('startBtn').disabled = false;
     document.getElementById('pauseBtn').disabled = true;
}

function resetTimer() {
     pauseTimer();
     time = 0;
     document.getElementById('time').innerText = "00:00";
     document.getElementById('startBtn').disabled = false;
     document.getElementById('pauseBtn').disabled = true;
}

function updateClock() {
     const now = new Date();
     const hours = now.getHours().toString().padStart(2, "0");
     const minutes = now.getMinutes().toString().padStart(2, "0");
     document.getElementById("clock").innerText = `${hours}:${minutes}`;
}

setInterval(updateClock, 1000);
updateClock();

function addTask() {
     const taskName = document.getElementById('taskName').value.trim();
     const taskCriteria = document.getElementById('taskCriteria').value.trim();
     const taskMark = document.getElementById('taskMark').value.trim();
     const taskTime = document.getElementById('taskTime').value.trim();
     if (taskName === "" || taskCriteria === "" || taskMark === "" || taskTime === "") {
          alert("Тапсырма атауын, дескрипторын, ұпай санын және орындау уақытын енгізіңіз.");
          return;
     }
     document.getElementById('taskName').value = "";
     document.getElementById('taskCriteria').value = "";
     document.getElementById('taskMark').value = "";
     document.getElementById('taskTime').value = "";
     document.getElementById("taskFields").style.display = "none";
     document.getElementById("taskToggleBtn").style.display = "inline-block";

     document.getElementById("tasksTable").style.display = "table";

     const taskContainer = document.getElementById('tasks');
     const row = document.createElement('tr');
     const taskId = taskContainer.children.length + 1;
     row.id = `task${taskId}`;
     row.innerHTML = `<td style="font-size: 18px;">${taskName}</td><td style="font-size: 18px;">${taskCriteria}</td><td style="font-weight: bold; font-size: 26px;">${taskMark}</td><td style="font-size: 18px;">${taskTime}</td>
                <td><button onclick="editTask(${taskId}, this)"><i class="fas fa-edit"></i></button><button onclick="removeTask(${taskId})"><i class="fas fa-trash-alt"></i></button></td>`;
     taskContainer.appendChild(row);

     saveTasksToLocalStorage();
}

function saveTasksToLocalStorage() {
     const tasks = [];
     document.querySelectorAll("#tasks tr").forEach(row => {
          const cells = row.children;
          tasks.push({
               name: cells[0].innerText,
               criteria: cells[1].innerText,
               mark: cells[2].innerText,
               time: cells[3].innerText
          });
     });
     localStorage.setItem("tasks", JSON.stringify(tasks));
}

function editTask(id, button) {
     const row = document.getElementById(`task${id}`);
     const cells = row.querySelectorAll("td");

     if (button.innerHTML.includes("fa-edit")) {
          cells[0].contentEditable = "true";
          cells[1].contentEditable = "true";
          cells[2].contentEditable = "true";
          cells[3].contentEditable = "true";
          button.innerHTML = '<i class="fas fa-save"></i>';
     } else {
          cells[0].contentEditable = "false";
          cells[1].contentEditable = "false";
          cells[2].contentEditable = "false";
          cells[3].contentEditable = "false";
          button.innerHTML = '<i class="fas fa-edit"></i>';
          saveTasksToLocalStorage();
     }
}

function removeTask(id) {
     const taskRow = document.getElementById('task' + id);
     if (taskRow) {
          taskRow.remove();
          saveTasksToLocalStorage();
          checkTableVisibility("tasks", "tasksTable");
     }
}

function addPlayer() {
     const playerName = document.getElementById('playerName').value.trim();
     if (playerName === "") {
          alert("Оқушының аты-жөнін енгізіңіз.");
          return;
     }
     document.getElementById('playerName').value = "";
     document.getElementById("playerFields").style.display = "none";
     document.getElementById("playerToggleBtn").style.display = "inline-block";

     document.getElementById("playersTable").style.display = "table";

     const playerContainer = document.getElementById('players');
     const playerId = playerContainer.children.length + 1;

     const row = document.createElement('tr');
     row.id = `player${playerId}`;
     row.innerHTML = `<td style="font-size: 26px;">${playerName}</td>
                <td id="score${playerId}" class="red" style="font-weight: bold; font-size: 26px;">0</td>
                <td>
                    <button onclick="updateScore(${playerId}, 1)"><i class="fas fa-plus"></i></button>
                    <button onclick="updateScore(${playerId}, -1)"><i class="fas fa-minus"></i></button>
                    <button onclick="editPlayer(${playerId}, this)"><i class="fas fa-edit"></i></button>
                    <button onclick="removePlayer(${playerId})"><i class="fas fa-trash-alt"></i></button>
                </td>`;
     playerContainer.appendChild(row);

     savePlayersToLocalStorage();
}

function savePlayersToLocalStorage() {
     const players = [];
     document.querySelectorAll("#players tr").forEach(row => {
          const name = row.children[0].innerText;
          const score = row.children[1].innerText;
          players.push({
               name,
               score
          });
     });

     localStorage.setItem("players", JSON.stringify(players));
}



function updateScore(id, change) {
     const scoreElement = document.getElementById('score' + id);
     let newScore = Math.min(10, Math.max(0, parseInt(scoreElement.innerText) + change));
     scoreElement.innerText = newScore;
     scoreElement.className = newScore <= 4 ? 'red' : newScore <= 7 ? 'orange' : 'green';

     savePlayersToLocalStorage();
}

function editPlayer(id, button) {
     const row = document.getElementById(`player${id}`);
     const nameCell = row.querySelector("td:first-child");

     if (button.innerHTML.includes("fa-edit")) {
          nameCell.contentEditable = "true";
          button.innerHTML = '<i class="fas fa-save"></i>';
     } else {
          nameCell.contentEditable = "false";
          button.innerHTML = '<i class="fas fa-edit"></i>';
          savePlayersToLocalStorage();
     }
}

function removePlayer(id) {
     const playerRow = document.getElementById('player' + id);
     if (playerRow) {
          playerRow.remove();
          savePlayersToLocalStorage();
          checkTableVisibility("players", "playersTable");
     }
}




function toggleTaskFields() {
     let fields = document.getElementById("taskFields");
     let btn = document.getElementById("taskToggleBtn");
     fields.style.display = "block";
     btn.style.display = "none";
}

function checkTaskFields() {
     let taskName = document.getElementById('taskName').value.trim();
     let taskCriteria = document.getElementById('taskCriteria').value.trim();
     let taskMark = document.getElementById('taskMark').value.trim();
}


function togglePlayerFields() {
     let fields = document.getElementById("playerFields");
     let btn = document.getElementById("playerToggleBtn");
     fields.style.display = "block";
     btn.style.display = "none";
}

function checkPlayerFields() {
     let playerName = document.getElementById('playerName').value.trim();
}

function checkTableVisibility(tableBodyId, tableId) {
     const tableBody = document.getElementById(tableBodyId);
     const table = document.getElementById(tableId);
     if (tableBody.children.length === 0) {
          table.style.display = "none";
     }
}

function loadTasksFromLocalStorage() {
     const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
     if (savedTasks.length > 0) {
          document.getElementById("tasksTable").style.display = "table";
     }
     savedTasks.forEach(task => {
          const taskContainer = document.getElementById('tasks');
          const row = document.createElement('tr');
          const taskId = taskContainer.children.length + 1;
          row.id = `task${taskId}`;
          row.innerHTML = `<td style="font-size: 18px;">${task.name}</td>
                           <td style="font-size: 18px;">${task.criteria}</td>
                           <td style="font-weight: bold; font-size: 26px;">${task.mark}</td>
                           <td style="font-size: 18px;">${task.time}</td>
                           <td>
                               <button onclick="editTask(${taskId}, this)"><i class="fas fa-edit"></i></button>
                               <button onclick="removeTask(${taskId})"><i class="fas fa-trash-alt"></i></button>
                           </td>`;
          taskContainer.appendChild(row);
     });
}

function loadPlayersFromLocalStorage() {
     const savedPlayers = JSON.parse(localStorage.getItem("players") || "[]");
     if (savedPlayers.length > 0) {
          document.getElementById("playersTable").style.display = "table";
     }
     savedPlayers.forEach(player => {
          const playerContainer = document.getElementById('players');
          const playerId = playerContainer.children.length + 1;

          const row = document.createElement('tr');
          row.id = `player${playerId}`;

          let scoreClass = player.score <= 4 ? 'red' : player.score <= 7 ? 'orange' : 'green';

          row.innerHTML = `<td style="font-size: 26px;">${player.name}</td>
                           <td id="score${playerId}" class="${scoreClass}" style="font-weight: bold; font-size: 26px;">${player.score}</td>
                           <td>
                               <button onclick="updateScore(${playerId}, 1)"><i class="fas fa-plus"></i></button>
                               <button onclick="updateScore(${playerId}, -1)"><i class="fas fa-minus"></i></button>
                               <button onclick="editPlayer(${playerId}, this)"><i class="fas fa-edit"></i></button>
                               <button onclick="removePlayer(${playerId})"><i class="fas fa-trash-alt"></i></button>
                           </td>`;
          playerContainer.appendChild(row);
     });
}

document.addEventListener("DOMContentLoaded", () => {
     loadTasksFromLocalStorage();
     loadPlayersFromLocalStorage();
});