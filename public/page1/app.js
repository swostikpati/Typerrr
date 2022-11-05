let socket = io(); //establishes connection with the socket server

//variables
let raceFlag = false;
let words;
let index = 0;

//DOM elements
const start_bt = document.querySelector("#start-bt");
const pre_start = document.querySelector(".pre-start");
const race_time = document.querySelector(".race-time");
const text_area = document.querySelector(".text-area");
const untyped = document.querySelector(".untyped");
const typed_corr = document.querySelector(".typed-corr");
const typed_wr = document.querySelector(".typed-wr");

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
    words = data;
    console.log(words);
    untyped.innerHTML = words;
    raceFlag = true;
})

start_bt.addEventListener("click", () => {
    socket.emit("raceStarted");
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
    if (index < words.length && key == words[index]) {
        index++;
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


    }
    else {
        //turn red
        typed_wr.innerHTML = words[index];
        untyped.innerHTML = words.slice(index + 1);


    }

}
//use while loop to loop till the end of the string
//use spans for color
//use z-index for cursor