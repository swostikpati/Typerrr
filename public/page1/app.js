let socket = io(); //establishes connection with the socket server

//client acknowledging after server confirmation - connect is a keyword
socket.on("connect", () => {
    console.log("Connection established to server via sockets");
})