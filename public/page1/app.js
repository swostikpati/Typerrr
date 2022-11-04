let socket = io(); //establishes connection with the socket server

//variables
let race = true;

//DOM elements
const start_bt = document.querySelector("#start-bt");
const pre_start = document.querySelector(".pre-start");
const race_time = document.querySelector(".race-time");
const text_area = document.querySelector(".text-area");

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
    let words = data;
    console.log(words);
    text_area.innerHTML = words;
})

start_bt.addEventListener("click", () => {
    socket.emit("raceStarted");
})

if (race) {
    //added keypress event - reference "https://www.section.io/engineering-education/keyboard-events-in-javascript/"
    document.addEventListener('keypress', (event) => {
        var name = event.key;
        var code = event.code;
        // Alert the key name and key code on keydown
        console.log(`Key pressed ${name} \r\n Key code value: ${code}`);

    }, false);
}

//use while loop to loop till the end of the string
//use spans for color
//use z-index for cursor