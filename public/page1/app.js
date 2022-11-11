let socket = io(); //establishes connection with the socket server

//variables
let raceFlag = false;
let words;
let index = 0;
let userN = "";
let userP = "";
let firstKeyFlag = true;
let userAuthData;

//Selecting DOM elements
const start_bt = document.querySelector("#start-bt");
const pre_start = document.querySelector(".pre-start");
const race_time = document.querySelector(".race-time");
const text_area = document.querySelector(".text-area");
const untyped = document.querySelector(".untyped");
const typed_corr = document.querySelector(".typed-corr");
const typed_wr = document.querySelector(".typed-wr");
const end_screen = document.querySelector(".end-screen");
const curr_pos = document.querySelector(".curr-pos");
const waiting = document.querySelector(".waiting");
const pos1 = document.querySelector(".pos1");
const pos2 = document.querySelector(".pos2");
const pos3 = document.querySelector(".pos3");
const pos4 = document.querySelector(".pos4");
const restart_bt = document.querySelector("#restart-bt");
const wpm = document.querySelector(".wpm");
const highscore_sec = document.querySelector(".highscore-sec");
const room_status = document.querySelector(".room-status");
const container1_txt = document.querySelector(".container1-txt");
const navbar = document.querySelector("#heading1");
const leaderboard = document.querySelector(".leaderboard");
const other_pos = document.querySelector(".other-pos");
const pos_div1 = document.querySelector(".pos1-div");

//User Authentication
userAuthCheck();

//SOCKETS
//client acknowledging after server confirmation - connect is a keyword
socket.on("connect", () => {
    console.log("Connection established to server via sockets");
    socket.on("roomData", (data) => {
        console.log("Room joined:", data);
    })

})

//Checking the login status sent by the server
socket.on("loginStatus", (data) => {
    if (data == "success") {
        alert("Logged in successfully!");
    }
    if (data == "failed") {
        alert("Login Failed! Username already exists or Password Error.")
        userN = "";
        userP = "";
        userAuthCheck(); //is the login failed, asking the user to provide the details again
    }
    if (data == "successCreated") {
        alert("New user profile created and logged in successfully!");
    }

})

//making the client aware that the room is full 
socket.on("roomFull", () => {
    start_bt.disabled = false; //enabling the race start button
    container1_txt.innerHTML = "Players Ready";
})

//Intializing the race page
socket.on("startRace", (data) => {
    leaderboard.style.display = "none";
    navbar.style.display = "none";
    pre_start.style.display = "none";
    race_time.style.display = "flex";
    words = data;
    untyped.innerHTML += words;
    raceFlag = true; //race started flag
})

//receiving and displaying the data about the winners when the race ends
socket.on("winners", (data) => {
    //initializing the race-end page
    other_pos.style.display = "flex";
    pos_div1.style.display = "flex";
    restart_bt.style.display = "block";
    waiting.style.display = "none";

    //displaying the data 
    if (data[0]) {
        pos1.innerHTML = data[0];
    }
    else {
        //ideally if even the person who came first leaves, there is no one to see this
        pos1.innerHTML = "Player left";
    }

    if (data[1]) {
        pos2.innerHTML = data[1];
    }
    else {
        pos2.innerHTML = "<em>Player left</em?";
    }

    if (data[2]) {
        pos3.innerHTML = data[2];
    }
    else {
        pos3.innerHTML = "<em>Player left</em?";
    }

    if (data[3]) {
        pos4.innerHTML = data[3];
    }
    else {
        pos4.innerHTML = "<em>Player left</em?";
    }
})

//receiving the current position
socket.on("positionUpdate", (data) => {
    curr_pos.innerText = `${data.racePos}/4`; //displaying the current position of the user in the race
    data.othersPos.sort(function (a, b) { return a - b }); //the most important line to remember ever (sorting in JS arrays is based on strings)

    //this entire section displays all the cursors currently racing and updates their position in realtime
    let arrCorr = []; //array stores the indices of the cursors behind the current user's cursor
    let arrUn = []; //array stores the indices of the cursors after the current user's cursor

    for (let i = 0; i < data.othersPos.length; i++) {
        let othersPos = data.othersPos[i];

        if (othersPos >= index && othersPos < words.length) {
            arrUn.push(othersPos);
        }
        else if (othersPos < index) {
            arrCorr.push(othersPos);
        }
    }
    //if a cursor exists behind the current cursor
    if (arrCorr[0]) {
        typed_corr.innerHTML = words.slice(0, arrCorr[0]) + `<span class="cursor1">|</span>`;
        for (let i = 0; i < arrCorr.length - 1; i++) {
            typed_corr.innerHTML += words.slice(arrCorr[i], arrCorr[i + 1]) + `<span class="cursor1">|</span>`;
        }
        typed_corr.innerHTML += words.slice(arrCorr[arrCorr.length - 1], index);
    }
    else {
        typed_corr.innerHTML = words.slice(0, index);
    }

    //if a cursor exists ater the current cursor
    if (arrUn[0]) {
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index, arrUn[0]);
        for (let i = 0; i < arrUn.length - 1; i++) {
            untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[i], arrUn[i + 1]);

        }
        untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[arrUn.length - 1]);
    }


})

//if a player drops before the race has started
socket.on("playerDropped", () => {
    start_bt.disabled = true; //the start button is disabled again 
})

//highscores are updated in the leaderboard
socket.on("updateHighscores", (data) => {
    let allHighscores = data.highscores;
    let i = 0;
    highscore_sec.innerHTML = "";
    //the top 5 highscores sent from the server's database are displayed
    while (i < allHighscores.length && i < 5) {
        highscore_sec.innerHTML += `<div class="highscore-rec">${allHighscores[i].username} : ${allHighscores[i].highscore}</div>`;
        i++;
    }
})

//displaying the number of people in the room in realtime
socket.on("liveRoomStatus", (data) => {
    room_status.innerHTML = `${data}/4`
})

//EVENT LISTENERS
start_bt.addEventListener("click", () => {
    socket.emit("raceReady");
})

//added keypress event - reference "https://www.section.io/engineering-education/keyboard-events-in-javascript/"
document.addEventListener('keypress', (e) => {
    if (raceFlag) {
        changeCol(checkKey(e.key));
    }
}, false);


//FUNCTIONS
//checks if the correct character was pressed by the user
function checkKey(key) {
    if (index < words.length && key == words[index]) {
        index++; //position of the cursor incremented
        let indexData = {
            username: userN,
            posI: index
        }
        socket.emit("indexUpdate", indexData); //emits to the server the updated position of the client's cursor
        return true;
    }
    return false;
}

//colors are changed of the text based on what was typed
function changeCol(corr) {
    if (corr) {
        typed_wr.innerHTML = "";
        typed_corr.innerHTML += words[index - 1];
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index);

        //when there are no more characters left in the word string, the client has finished the race
        if (index == words.length) {

            console.log("race finished");
            raceFlag = false;
            //setting up the end-screen/waiting page
            race_time.style.display = "none";
            navbar.style.display = "flex";
            leaderboard.style.display = "block";
            end_screen.style.display = "flex";


            socket.emit("raceFinish", userN);
        }


    }
    else {
        typed_wr.innerHTML = `<span class="cursor">|</span>` + words[index];
        untyped.innerHTML = words.slice(index + 1);
    }

}

//prompting the user to input username and password until they input something
function userAuthCheck() {
    while (userN == "" || userN == null) {
        userN = prompt("Please enter your username:");
    }
    while (userP == "" || userP == null) {
        userP = prompt("Please enter your password:");
    }


    userAuthData = {
        username: userN,
        pass: userP
    }

    socket.emit("userAuth", userAuthData); //emitting the user data to the server
}

