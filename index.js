let express = require("express");
let app = express();
app.use(express.json());
const PORT = 3000;

let http = require("http");
let server = http.createServer(app);


//variables
let tr = 0; //current room number
let rooms = {};
let newRoomFlag = false;

server.listen(PORT, () => {
    console.log("listerning on port 3000");
})

app.use("/", express.static("public/page1"))

let io = require("socket.io");
io = new io.Server(server);

io.sockets.on("connect", (socket) => {
    console.log("New connection:", socket.id);

    //checking disconnection of the specific socket
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        console.log("Room: ", socket.roomNo);
        rooms[socket.roomNo]--;
        console.log("Room Capacity: ", rooms[socket.roomNo]);
    })

    for (let i = 0; i <= tr; i++) {
        if (rooms[i] < 4) {
            socket.roomNo = i;
            rooms[i]++;
            newRoomFlag = false;
            break;
        }
        else {
            newRoomFlag = true;
        }
    }
    if (newRoomFlag) {
        tr++;
        socket.roomNo = tr;
        newRoomFlag = false;
        rooms[tr] = 1;
    }
    socket.join(socket.roomNo);
    console.log("Room Capacity: ", rooms[socket.roomNo]);
    io.sockets.to(socket.roomNo).emit("roomData", socket.roomNo);
})

let datastore = require("nedb");
let db = new datastore({ filename: "highscores.db", timestampData: true });

db.loadDatabase();