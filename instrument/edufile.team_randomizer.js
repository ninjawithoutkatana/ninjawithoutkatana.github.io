/* APPLICATION?edufile.team_randomizer/v0.2(#edufile6.0.0125) */
console.log("Hi, this is the script file loading");

window.addEventListener("DOMContentLoaded", function(event) {

//Show that DOM has loaded ....
console.log("DOM fully loaded and parsed.");

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

	//Read people (volunteers) and store in array 'peopleArray'
	// ->Remove possible leading and trailing white spaces with trim()
	var peopleString = document.getElementById("volunteers").value.trim();
	// ->https://stackoverflow.com/questions/650022/how-do-i-split-a-string-with-multiple-separators-in-javascript
	var peopleArray = peopleString.split(/(?:,|\n)+/);
	console.log(peopleArray);
	
	//Read number of required teams and store in 'numberOfTeams'
	var numberOfTeams = parseInt(document.getElementById("numberTeams").value);
	
	//Calculate number of members for team
	var numberOfTeamMembers = parseInt(peopleArray.length / numberOfTeams);
	console.log(numberOfTeamMembers);
	
	//Calculate remainder of people and store in 'overflowPeople' 
	//e.g. 11 people will form teams of 3 with a remainder of 2
	var overflowPeople = peopleArray.length % numberOfTeams;
	console.log(overflowPeople);
	
	//Build 'teams' objects array - one object for each team
	// ->Declare empty array;
	var teams = [];
	for (var i = 0; i < numberOfTeams; i++) {
		// -> create a new object and push to 'teams' array
		teams.push(new teamConstructor());
		// -> set size property of team object to 'numberOfTeamMembers'
		teams[i].size = numberOfTeamMembers;
	}
	
	//Distribute count of 'overflowPeople' to 'teams'
	for (var i = 0; i <	overflowPeople; i++) {
		// -> increment size property of team object by 1
		teams[i].size++;
	}
	
	//Loop trough each 'teams' object ...
	for (var i = 0; i <	teams.length; i++) {
		// ... and assign team members
		for (var ii = 0; ii <	teams[i].size; ii++) {
			// -> find random number between 0 and the last 'peopleArray' element index
			var randomNumber = mcrSf.randomNum(0, (peopleArray.length - 1));
			// -> push name from 'peopleArray' with randomNumber index into 
			// 'members' array of looped teams object
			teams[i].members.push(peopleArray[randomNumber].trim());
			// remove name from 'peopleArray' with randomNumber
			peopleArray = mcrSf.remArrElByIndex(peopleArray, randomNumber);
		}
	}
	console.log(teams);
	
	//Output teams
	var html = "";
	for (var i = 0; i <	teams.length; i++) {
		html += "<h1 style='font-size: 30px; font-weight: bold; margin-top: 30px;'>" + (i + 1) + "-топ</h1>";
		html += "<p style='font-style: italic;'>Бұл " + (i + 1) + "-топқа <b>" + teams[i].members.length + " оқушы</b> бөлінді</p>";
		html += "<ul>";
		for (var ii = 0; ii <	teams[i].members.length; ii++) {
			html += "<li style='font-size: 18px; font-weight: bold; margin-bottom: 5px;'>" + teams[i].members[ii] + "</li>";
		}
		html += "</ul>";
	}
	document.getElementById('formedTeams').innerHTML = html;
}


// Constructor for 'teams' objects
// Decided to use objects over arrays as it will be easier to manage future feature enhancements
function teamConstructor() {
	this.size = 0;
	this.members = [];
}


function removeArrayElement() {
	/* This function is not used in this application.
	   It is included in this file as it was discussed in class. */
	var tempPerson = peopleArray[(peopleArray.length-1)];
	peopleArray[randomNumber] = tempPerson;
	peopleArray.pop();	
}




var mcrSf = {
  rev: "See individual Function/Method revisions.",
/**
 *
 * removes one or more elements from array by index
 * @param {Object(Array)} arr - array that elements to be removed from
 * @param {Number/String/Object(Array)} elements - index(es) of elements to be
 *           	removed - OPTIONAL, default value: false
 * @param {Boolean} removed - flag to return modified array or removed elements
 * @return {Object(Array)} - modified array with elements removed
 *
 * mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2)
 * returns ["A", "B", "D"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2, false)
 * returns ["A", "B", "D"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D"], 2, true)
 * returns ["C"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4")
 * returns ["A", "B", "E", "F"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4", false)
 * returns ["A", "B", "E", "F"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], "2-4", true)
 * returns ["C", "D"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], {1, 3, 4})
 * returns ["A", "C", "F"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], {1, 3, 4}, false)
 * returns ["A", "C", "F"]
 * mcrSf.remArrElByIndex(["A", "B", "C", "D", "E", "F"], {1, 3, 4}, true)
 * returns ["B", "D", "E"]
 *
 * STRATEGY: Avail of splice method for JavaScript arrays
 */ 
 remArrElByIndex: function(arr, elements, removed) {
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
		for (var i = elements.length - 1; i > -1 ; i--) {
			modArr.unshift(arr.splice(elements[i], 1)[0]);
		}
	}
	if (removed === false) {
		return arr;
	}
	else {
		return modArr;
	}	
 },


/**
 * generates a random number between two values (min and max)
 * @param {Number} min - start value of specified range (lowest possible value)
 * @param {Number} max - end value of specified range (highest possible value)
 * @return {Number} - random value between min and max (inclusive)
 *
 * mcrSf.randomNum(0, 10)
 * returns >= 0 <= 10 //e.g. any one integer number between 0 and 10 inclusive
 * mcrSf.randomNum(6, 10)
 * returns >= 6 <= 10 //e.g. any one integer number between 6 and 10 inclusive
 * mcrSf.randomNum(0, 0)
 * returns 0
 * mcrSf.randomNum(10, 10)
 * returns 10
 * mcrSf.randomNum(-5, 5)
 * returns >= -5 <= 5 //e.g. any one integer number between -5 and 5 inclusive
 * mcrSf.randomNum(10, 0)
 * returns null
 * mcrSf.randomNum('ABC', 10)
 * returns null
 * mcrSf.randomNum(0, 'ABC')
 * returns null
 * mcrSf.randomNum('', 10)
 * returns null
 * mcrSf.randomNum(0, '')
 * returns null
 * mcrSf.randomNum(null, 10)
 * returns null
 * mcrSf.randomNum(0, null)
 * returns null
 *
 * STRATEGY: Avail of Math.floor(Math.random() * x + y) formulae
 */ 
randomNum: function(min, max) {
    mcrSf.randomNum.rev = "0.2";
    if (min > max || isNaN(min) || isNaN(max) || min === "" || max === "" || min === null || max === null) {return null;}
    return Math.floor(Math.random() * (max - min + 1) + min);
}

};