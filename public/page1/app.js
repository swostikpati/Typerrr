let socket = io(); //establishes connection with the socket server

//variables
let raceFlag = false;
let words;
let index = 0;
let userN = "";
let userP = "";
let firstKeyFlag = true;
let userAuthData;

//DOM elements
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

userAuthCheck();


//client acknowledging after server confirmation - connect is a keyword
socket.on("connect", () => {
    console.log("Connection established to server via sockets");
    socket.on("roomData", (data) => {
        console.log("Room joined:", data);
    })

})

socket.on("loginStatus", (data) => {
    if (data == "success") {
        alert("Logged in successfully!");
    }
    if (data == "failed") {
        alert("Login Failed! Username already exists or Password Error.")
        userN = "";
        userP = "";
        userAuthCheck();
    }
    if (data == "successCreated") {
        alert("New user profile created and logged in successfully!");
    }

})

socket.on("roomFull", () => {
    start_bt.disabled = false;
    container1_txt.innerHTML = "Players Ready";
})

socket.on("startRace", (data) => {
    leaderboard.style.display = "none";
    navbar.style.display = "none";
    pre_start.style.display = "none";
    race_time.style.display = "flex";
    words = data;
    untyped.innerHTML += words;
    raceFlag = true;
})

socket.on("winners", (data) => {
    other_pos.style.display = "flex";
    pos_div1.style.display = "flex";
    restart_bt.style.display = "block";
    waiting.style.display = "none";
    if (data[0]) {
        pos1.innerHTML = data[0];
    }
    else {
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

socket.on("positionUpdate", (data) => {
    curr_pos.innerText = `${data.racePos}/4`;
    data.othersPos.sort(function (a, b) { return a - b }); //the most important line to remember ever

    let arrCorr = [];
    let arrUn = [];
    for (let i = 0; i < data.othersPos.length; i++) {
        let othersPos = data.othersPos[i];

        if (othersPos >= index && othersPos < words.length) {
            arrUn.push(othersPos);
        }
        else if (othersPos < index) {
            arrCorr.push(othersPos);
        }
    }
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

    if (arrUn[0]) {
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index, arrUn[0]);
        for (let i = 0; i < arrUn.length - 1; i++) {
            untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[i], arrUn[i + 1]);

        }
        untyped.innerHTML += `<span class="cursor1">|</span>` + words.slice(arrUn[arrUn.length - 1]);
    }


})

socket.on("playerDropped", () => {
    start_bt.disabled = true;
})

socket.on("updateHighscores", (data) => {
    let allHighscores = data.highscores;
    let i = 0;
    highscore_sec.innerHTML = "";
    while (i < allHighscores.length && i < 5) {
        highscore_sec.innerHTML += `<div class="highscore-rec">${allHighscores[i].username} : ${allHighscores[i].highscore}</div>`;
        i++;
    }
})


socket.on("liveRoomStatus", (data) => {
    room_status.innerHTML = `${data}/4`
})

start_bt.addEventListener("click", () => {
    socket.emit("raceReady");
})


//added keypress event - reference "https://www.section.io/engineering-education/keyboard-events-in-javascript/"
document.addEventListener('keypress', (e) => {
    if (raceFlag) {
        changeCol(checkKey(e.key));
    }
}, false);



function checkKey(key) {
    if (index < words.length && key == words[index]) {
        index++;
        let indexData = {
            username: userN,
            posI: index
        }
        socket.emit("indexUpdate", indexData);
        return true;
    }
    return false;
}

function changeCol(corr) {
    if (corr) {
        typed_wr.innerHTML = "";
        typed_corr.innerHTML += words[index - 1];
        untyped.innerHTML = `<span class="cursor">|</span>` + words.slice(index);

        if (index == words.length) {

            console.log("race finished");
            raceFlag = false;
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

    socket.emit("userAuth", userAuthData);
}

//use while loop to loop till the end of the string
//use spans for color
//use z-index for cursor
//everytime the index changes - emit to the server based on which current position will be known
//add the check where one person leaves in the middle of the race...timeout

//if someone exits before start...disable start

//one way that might work is to give a class to the cursor specifically and animating it in css
//fix the case where all four are activated

//user authentication
//database for highscores and user profiles
//styling
//going back to the main page
//add wpm