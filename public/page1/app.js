let socket = io(); //establishes connection with the socket server

//variables
let raceFlag = false;
let words;
let index = 0;
let userN;

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



userN = prompt("Please enter your username:");

//client acknowledging after server confirmation - connect is a keyword
socket.on("connect", () => {
    console.log("Connection established to server via sockets");
    socket.on("roomData", (data) => {
        console.log("Room joined:", data);
    })

})

socket.on("roomFull", () => {
    // roomFull = data;
    console.log("yes");
    start_bt.disabled = false;
})

socket.on("startRace", (data) => {
    pre_start.style.display = "none";
    race_time.style.display = "block";
    words = data;
    console.log(words);
    untyped.innerHTML = words;
    raceFlag = true;
})

socket.on("winners", (data) => {
    console.log(data);
    waiting.innerHTML = 0;
    pos1.innerHTML += data[0];
    pos2.innerHTML += data[1];
    pos3.innerHTML += data[2];
    pos4.innerHTML += data[3];

})

socket.on("positionUpdate", (data) => {
    console.log(data);
    curr_pos.innerText = `${data}/4`;

})

start_bt.addEventListener("click", () => {
    socket.emit("raceReady");
})


//added keypress event - reference "https://www.section.io/engineering-education/keyboard-events-in-javascript/"
document.addEventListener('keypress', (e) => {
    // var name = event.key;
    // var code = event.code;
    // // Alert the key name and key code on keydown
    // console.log(`Key pressed ${name} \r\n Key code value: ${code}`);
    // let key = event.key;
    if (raceFlag) {
        changeCol(checkKey(e.key));
    }
}, false);



function checkKey(key) {
    // console.log(key + ", ", words[index]);
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
        //turn green
        typed_wr.innerHTML = "";
        typed_corr.innerHTML += words[index - 1];
        untyped.innerHTML = words.slice(index);
        if (typed_corr.innerText == words) {

            console.log("race finished");
            raceFlag = false;
            race_time.style.display = "none";
            end_screen.style.display = "block";
            socket.emit("raceFinish", userN);
        }


    }
    else {

        // else {
        //turn red
        typed_wr.innerHTML = words[index];
        untyped.innerHTML = words.slice(index + 1);
        // }


    }

}
//use while loop to loop till the end of the string
//use spans for color
//use z-index for cursor
//everytime the index changes - emit to the server based on which current position will be known
//add the check where one person leaves in the middle of the race...timeout