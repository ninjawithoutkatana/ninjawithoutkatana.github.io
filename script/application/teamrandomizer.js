/* APPLICATION?edufile.teamrandomizer/v0.2(#edufile6.2.prerelease.0325) */
console.log("Бұл скрипт файлын жүктеу");

window.addEventListener("DOMContentLoaded", function (event) {
	console.log("DOM толығымен жүктелді және талданды");

	addEvents();
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2, false))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2, true))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4"))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4", false))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4", true))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], [1, 3, 4]))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], [1, 3, 4], false))
	console.log(mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], [1, 3, 4], true))
});

function addEvents() {
	document.getElementById('formTeams').addEventListener('click', formTeams);
}

function formTeams() {
	console.log("formTeams()");

	var peopleString = document.getElementById("volunteers").value.trim();
	var peopleArray = peopleString.split(/(?:,|\n)+/);
	console.log(peopleArray);

	var numberOfTeams = parseInt(document.getElementById("numberTeams").value);

	var numberOfTeamMembers = parseInt(peopleArray.length / numberOfTeams);
	console.log(numberOfTeamMembers);

	var overflowPeople = peopleArray.length % numberOfTeams;
	console.log(overflowPeople);

	var teams = [];
	for (var i = 0; i < numberOfTeams; i++) {
		teams.push(new teamConstructor());
		teams[i].size = numberOfTeamMembers;
	}

	for (var i = 0; i < overflowPeople; i++) {
		teams[i].size++;
	}

	for (var i = 0; i < teams.length; i++) {
		for (var ii = 0; ii < teams[i].size; ii++) {
			var randomNumber = mcrSf.randomNum(0, (peopleArray.length - 1));
			teams[i].members.push(peopleArray[randomNumber].trim());
			peopleArray = mcrSf.remArrElByIndex(peopleArray, randomNumber);
		}
	}
	console.log(teams);

	var html = "";
	for (var i = 0; i < teams.length; i++) {
		html += "<h1 style='font-size: 30px; font-weight: bold; margin-top: 30px;'>" + (i + 1) + "-топ</h1>";
		html += "<p style='font-style: italic;'>Бұл " + (i + 1) + "-топқа <b>" + teams[i].members.length + " оқушы</b> бөлінді</p>";
		html += "<ul>";
		for (var ii = 0; ii < teams[i].members.length; ii++) {
			html += "<li style='font-size: 18px; font-weight: bold; margin-bottom: 5px;'>" + teams[i].members[ii] + "</li>";
		}
		html += "</ul>";
	}
	document.getElementById('formedTeams').innerHTML = html;
}

function teamConstructor() {
	this.size = 0;
	this.members = [];
}

function removeArrayElement() {
	var tempPerson = peopleArray[(peopleArray.length - 1)];
	peopleArray[randomNumber] = tempPerson;
	peopleArray.pop();
}

var mcrSf = {
	rev: "See individual Function/Method revisions.",
	remArrElByIndex: function (arr, elements, removed) {
		mcrSf.remArrElByIndex.rev = "0.1";
		removed = removed || false;
		if (typeof elements === "number") {
			var modArr = arr.splice(elements, 1);
		}
		if (typeof elements === "string") {
			var indexes = elements.split("-");
			var modArr = arr.splice(parseInt(indexes[0]),
				(parseInt(indexes[1]) - parseInt(indexes[0])));
		}
		if (typeof elements === "object") {
			var modArr = [];
			for (var i = elements.length - 1; i > -1; i--) {
				modArr.unshift(arr.splice(elements[i], 1)[0]);
			}
		}
		if (removed === false) {
			return arr;
		} else {
			return modArr;
		}
	},

	randomNum: function (min, max) {
		mcrSf.randomNum.rev = "0.2";
		if (min > max || isNaN(min) || isNaN(max) || min === "" || max === "" || min === null || max === null) {
			return null;
		}
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

};