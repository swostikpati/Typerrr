let express = require("express");
let wordsJSON = require("./words1k.json");
let app = express();
app.use(express.json());
const PORT = 3000;

let http = require("http");
let server = http.createServer(app);

server.listen(PORT, () => {
    console.log("listerning on port 3000");
})

app.use("/", express.static("public/page1"))

let io = require("socket.io");
io = new io.Server(server);


//variables
let tr = 0; //current room number
let rooms = {};
let newRoomFlag = true;


io.sockets.on("connect", (socket) => {

    console.log("New connection:", socket.id);

    //checking disconnection of the specific socket
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        console.log("Room: ", socket.roomNo);
        rooms[socket.roomNo].cap--;
        console.log("Room Capacity: ", rooms[socket.roomNo].cap);
        if (rooms[socket.roomNo].f) {
            console.log("yes buddy");
            io.sockets.to(rooms[socket.roomNo].n).emit("playerDropped");
        }
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            //rooms[socket.roomNo].f = true;
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners);
        }
    })

    for (let i = 1; i <= tr; i++) {
        if (rooms[i].cap < 4 && rooms[i].f) {
            socket.roomNo = rooms[i].n;
            rooms[i].cap++;
            newRoomFlag = false;
            if (rooms[i].cap > 3) {
                io.sockets.to(rooms[i].n).emit("roomFull");
            }
            break;
        }
        else {
            // let a = rooms[i].n;
            // console.log(a);
            if (rooms[i].f) {
                io.sockets.to(rooms[i].n).emit("roomFull");
            }
            newRoomFlag = true;
        }
    }
    if (newRoomFlag) {
        if (tr != 0) {
            io.sockets.to(rooms[tr].n).emit("roomFull");
        }
        tr++;
        socket.roomNo = tr;
        newRoomFlag = false;
        rooms[tr] = { n: tr, f: true, cap: 1, winners: [], positions: {} };
    }
    socket.join(socket.roomNo);
    if (rooms[socket.roomNo].cap > 3) {
        io.sockets.to(socket.roomNo).emit("roomFull");
    }
    console.log("Room Capacity: ", rooms[socket.roomNo].cap);
    io.sockets.to(socket.roomNo).emit("roomData", socket.roomNo);

    socket.on("raceReady", () => {
        words = ""
        for (let i = 0; i < 20; i++) {
            if (i == 19) {
                words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1]; //without space in the end
                break;
            }
            words = words + wordsJSON.words[Math.floor(Math.random() * (1000)) + 1] + " ";
        }
        rooms[socket.roomNo].f = false;
        io.sockets.to(socket.roomNo).emit("startRace", words);
    })

    socket.on("indexUpdate", (data) => {
        rooms[socket.roomNo].positions[data.username] = data.posI;
        let count = 1;
        for (let key in rooms[socket.roomNo].positions) {
            if (key != data.username && rooms[socket.roomNo].positions[key] > rooms[socket.roomNo].positions[data.username]) {
                count++;
            }

        }
        io.sockets.to(socket.id).emit("positionUpdate", count);
    })

    socket.on("raceFinish", (data) => {
        rooms[socket.roomNo].winners.push(data);
        console.log(rooms[socket.roomNo].winners);
        if (rooms[socket.roomNo].winners.length >= rooms[socket.roomNo].cap) {
            //rooms[socket.roomNo].f = true;
            io.sockets.to(socket.roomNo).emit("winners", rooms[socket.roomNo].winners);
        }
    })


})


let datastore = require("nedb");
let db = new datastore({ filename: "highscores.db", timestampData: true });

db.loadDatabase();