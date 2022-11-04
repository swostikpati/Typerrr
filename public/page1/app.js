let socket = io(); //establishes connection with the socket server

//variables
// let roomFull = false;

//DOM elements
const start_bt = document.querySelector("#start-bt");
const pre_start = document.querySelector(".pre-start");
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

socket.on("startRace", () => {
    pre_start.style.display = "none";
})

start_bt.addEventListener("click", () => {
    socket.emit("raceStarted");
})

//added keypress event
document.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    console.log(`Key pressed ${name} \r\n Key code value: ${code}`);
}, false);